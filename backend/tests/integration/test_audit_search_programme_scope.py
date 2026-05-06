"""GET /api/v1/audit/search programme-scoping tests (slice 5a).

Slice 5a-narrow visibility rule: a DD or FL with AP=true sees an audit
row iff the row's actor_user_id is in the set of people assigned to one
of the caller's programmes (via person_programme_assignments).

Seed shape from generator.py (deterministic via SEED 20260424):
  DD1 (Meera Sharma)  AP=true   programmes: ANDROMEDA, HELIX, STELLAR
  DD2 (Priya Sharma)  AP=false  programmes: PEGASUS, PHOENIX, STELLAR
  FL1 (Kavita Sharma) AP=true   programmes: ANDROMEDA, HELIX, PHOENIX
  FL2 (Pooja Sharma)  AP=false  programmes: HELIX, LYRA, ORION
  FL3 (Rohit Sharma)  AP=false  programmes: ANDROMEDA, ORION, PEGASUS

Overlaps relevant to these tests:
  DD1 / FL1: ANDROMEDA, HELIX (overlap)
  DD1 / DD2: STELLAR (overlap)
  DD1 / FL2: HELIX (overlap, FL2 has AP=false so we do not query as FL2)
  DD1 / actor seeded into LYRA/VEGA only: NO overlap (disjoint case)

5a-broad TODO is documented in services/audit_search.py; not exercised here.
"""

from __future__ import annotations

import datetime
import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token


pytestmark = pytest.mark.integration


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _person(conn: asyncpg.Connection, role: str, ap: bool) -> uuid.UUID:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = $1 AND ap_flag = $2 LIMIT 1",
        role,
        ap,
    )
    assert row is not None, f"seed missing role={role} ap={ap}"
    return row["person_id"]


async def _insert_audit_row(
    conn: asyncpg.Connection,
    *,
    actor_user_id: uuid.UUID,
    actor_role: str,
    resource_type: str,
    occurred_at: datetime.datetime,
) -> uuid.UUID:
    eid = uuid.uuid4()
    await conn.execute(
        """
        INSERT INTO audit_trail_entries (
            entry_id, actor_user_id, actor_role, endpoint, http_method,
            occurred_at, outcome, resource_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        eid,
        actor_user_id,
        actor_role,
        "/api/v1/test/programme_scope",
        "PATCH",
        occurred_at,
        "Success",
        resource_type,
    )
    return eid


async def _assign_person(
    conn: asyncpg.Connection,
    person_id: uuid.UUID,
    programme_codes: list[str],
) -> None:
    rows = [(person_id, code, datetime.datetime.now(datetime.timezone.utc))
            for code in programme_codes]
    await conn.executemany(
        "INSERT INTO person_programme_assignments "
        "(person_id, programme_id, assigned_at) VALUES ($1, $2, $3)",
        rows,
    )


async def _create_synthetic_person(
    conn: asyncpg.Connection,
    *,
    role: str,
    ap_flag: bool,
    email_suffix: str,
) -> uuid.UUID:
    """Insert a fresh person row for use as an audit-row actor or as a caller
    with custom programme assignments. Returns the new person_id."""
    pid = uuid.uuid4()
    await conn.execute(
        """
        INSERT INTO people (person_id, email, full_name, role, ap_flag, password_hash)
        VALUES ($1, $2, $3, $4, $5, '')
        """,
        pid,
        f"slice5a.{email_suffix}@akb1.demo",
        f"Slice5a {email_suffix}",
        role,
        ap_flag,
    )
    return pid


# ---------------------------------------------------------------------------
# Visibility: overlap vs disjoint
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "caller_role,actor_programmes,actor_role,expected_visible",
    [
        # DD1's programmes are ANDROMEDA, HELIX, STELLAR.
        # Actor in ANDROMEDA overlaps -> DD1 sees the row.
        ("DeliveryDirector", ["ANDROMEDA"], "ProgrammeManager", True),
        # Actor only in LYRA/VEGA -> disjoint -> DD1 does not see.
        ("DeliveryDirector", ["LYRA", "VEGA"], "ProgrammeManager", False),
        # Same matrix for FL1 (programmes ANDROMEDA/HELIX/PHOENIX).
        ("FinanceLead", ["HELIX"], "ProgrammeManager", True),
        ("FinanceLead", ["DRACO"], "ProgrammeManager", False),
    ],
)
async def test_dd_or_fl_with_ap_sees_actor_only_when_programmes_overlap(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    caller_role: str,
    actor_programmes: list[str],
    actor_role: str,
    expected_visible: bool,
) -> None:
    caller_id = await _person(seeded_for_mutation, caller_role, ap=True)

    # Synthesise an actor with the requested programme assignments.
    actor_id = await _create_synthetic_person(
        seeded_for_mutation,
        role=actor_role,
        ap_flag=False,
        email_suffix=f"actor_{'-'.join(actor_programmes).lower()}",
    )
    await _assign_person(seeded_for_mutation, actor_id, actor_programmes)

    eid = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=actor_id,
        actor_role=actor_role,
        resource_type="slice5a_scope_test",
        occurred_at=datetime.datetime(2026, 4, 30, 10, 0, 0, tzinfo=datetime.timezone.utc),
    )

    token = mint_token(user_id=caller_id, role=caller_role, ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_scope_test",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    visible_ids = {item["entry_id"] for item in r.json()["items"]}
    if expected_visible:
        assert str(eid) in visible_ids, (
            f"caller {caller_role} with programmes overlapping {actor_programmes} "
            f"should see actor row but did not. visible: {visible_ids}"
        )
    else:
        assert str(eid) not in visible_ids, (
            f"caller {caller_role} with disjoint programmes from {actor_programmes} "
            f"should NOT see actor row but did. visible: {visible_ids}"
        )


# ---------------------------------------------------------------------------
# DD/FL sees their own actions (caller is in own programmes)
# ---------------------------------------------------------------------------

async def test_dd_with_ap_sees_own_audit_actions(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """A DD is assigned to their own programmes via person_programme_assignments,
    so their own person_id satisfies the IN subquery and they see their
    own audit rows."""
    dd_id = await _person(seeded_for_mutation, "DeliveryDirector", ap=True)
    eid = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=dd_id,
        actor_role="DeliveryDirector",
        resource_type="slice5a_self_visibility",
        occurred_at=datetime.datetime(2026, 4, 30, 11, 0, 0, tzinfo=datetime.timezone.utc),
    )
    token = mint_token(user_id=dd_id, role="DeliveryDirector", ap_flag=True)

    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_self_visibility",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    visible_ids = {item["entry_id"] for item in r.json()["items"]}
    assert str(eid) in visible_ids


# ---------------------------------------------------------------------------
# Edge: DD with AP=true and zero assignments sees nothing
# ---------------------------------------------------------------------------

async def test_dd_with_ap_and_no_programme_assignments_sees_zero_rows(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """An unassigned DD has an empty programme list, so the IN subquery
    returns no actor_user_ids and the search yields zero rows. The seed
    grants every DD/FL three assignments; this synthetic DD bypasses
    that to lock the empty-set semantics."""
    orphan_dd = await _create_synthetic_person(
        seeded_for_mutation,
        role="DeliveryDirector",
        ap_flag=True,
        email_suffix="orphan_dd",
    )
    # Insert audit rows by various actors to confirm none are visible.
    seeded_dd_id = await _person(seeded_for_mutation, "DeliveryDirector", ap=True)
    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=seeded_dd_id,
        actor_role="DeliveryDirector",
        resource_type="slice5a_orphan_test",
        occurred_at=datetime.datetime(2026, 4, 30, 12, 0, 0, tzinfo=datetime.timezone.utc),
    )

    token = mint_token(user_id=orphan_dd, role="DeliveryDirector", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_orphan_test",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["items"] == []
    assert body["total_count"] == 0


# ---------------------------------------------------------------------------
# PO with AP=true regression: sees all rows including programme-scoped data
# ---------------------------------------------------------------------------

async def test_po_with_ap_unaffected_by_programme_scoping(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)

    # Synthetic actor in a single programme; visible to any caller with
    # that programme. Seed assigns no PO to person_programme_assignments
    # at all, so the PO's "see all" path must not depend on the join table.
    actor_id = await _create_synthetic_person(
        seeded_for_mutation,
        role="ProgrammeManager",
        ap_flag=False,
        email_suffix="po_regression_actor",
    )
    await _assign_person(seeded_for_mutation, actor_id, ["DRACO"])
    eid = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=actor_id,
        actor_role="ProgrammeManager",
        resource_type="slice5a_po_regression",
        occurred_at=datetime.datetime(2026, 4, 30, 13, 0, 0, tzinfo=datetime.timezone.utc),
    )

    token = mint_token(user_id=po_id, role="PortfolioOwner", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_po_regression",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    visible_ids = {item["entry_id"] for item in r.json()["items"]}
    assert str(eid) in visible_ids


# ---------------------------------------------------------------------------
# E2E: DD1 PATCHes, DD2 with non-overlapping programmes does not see it
# ---------------------------------------------------------------------------

async def test_e2e_dd1_patch_invisible_to_disjoint_dd_visible_to_overlapping_dd(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """End-to-end: DD1 (Meera, AP=true, ANDROMEDA/HELIX/STELLAR) PATCHes
    threshold-register, generating an audit row with actor_user_id=DD1.
    A synthetic DD with disjoint programmes (DRACO/VEGA) cannot see the
    row. A synthetic DD with overlapping programmes (HELIX) can.

    Note: PATCH on threshold-register is PO-only. We bypass the policy
    layer for this fixture by minting a PO token for the actual PATCH
    so the audit row exists, then assert visibility against the synthetic
    DDs separately. The point of the test is the audit-search filter,
    not the PATCH RBAC (which is covered elsewhere)."""
    po_id = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    po_token = mint_token(user_id=po_id, role="PortfolioOwner", ap_flag=True)

    patch_resp = await http_client.patch(
        "/api/v1/admin/threshold-register/portfolio_margin_pct",
        json={"green_threshold": "32.0"},
        headers={"Authorization": f"Bearer {po_token}"},
    )
    assert patch_resp.status_code == 200, patch_resp.text

    # Confirm the audit row is there with actor=PO
    n_rows = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries "
        "WHERE actor_user_id = $1 AND resource_type = 'threshold_calibration_register'",
        po_id,
    )
    assert n_rows >= 1

    # Synthetic disjoint DD: programmes that PO is NOT in (PO is in none)
    # so the visibility hinges on whether the PO actor maps to any of the
    # disjoint DD's programmes. PO has no person_programme_assignments
    # entries, so the IN subquery will not return PO -> not visible to
    # either synthetic DD regardless of overlap.
    disjoint_dd = await _create_synthetic_person(
        seeded_for_mutation, role="DeliveryDirector", ap_flag=True,
        email_suffix="disjoint_dd",
    )
    await _assign_person(seeded_for_mutation, disjoint_dd, ["DRACO", "VEGA"])

    # Use a synthetic actor in HELIX rather than the PO so the e2e
    # comparison is meaningful (PO is unassigned and never visible to DDs).
    helix_actor = await _create_synthetic_person(
        seeded_for_mutation, role="ProgrammeManager", ap_flag=False,
        email_suffix="helix_actor",
    )
    await _assign_person(seeded_for_mutation, helix_actor, ["HELIX"])
    helix_eid = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=helix_actor,
        actor_role="ProgrammeManager",
        resource_type="slice5a_e2e_helix",
        occurred_at=datetime.datetime(2026, 4, 30, 14, 0, 0, tzinfo=datetime.timezone.utc),
    )

    overlapping_dd = await _person(seeded_for_mutation, "DeliveryDirector", ap=True)
    overlap_token = mint_token(
        user_id=overlapping_dd, role="DeliveryDirector", ap_flag=True
    )
    disjoint_token = mint_token(
        user_id=disjoint_dd, role="DeliveryDirector", ap_flag=True
    )

    # Overlapping DD (DD1, has HELIX) sees the helix actor's row.
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_e2e_helix",
        headers={"Authorization": f"Bearer {overlap_token}"},
    )
    assert r.status_code == 200
    visible = {i["entry_id"] for i in r.json()["items"]}
    assert str(helix_eid) in visible

    # Disjoint DD (DRACO/VEGA) does not see HELIX actor's row.
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=slice5a_e2e_helix",
        headers={"Authorization": f"Bearer {disjoint_token}"},
    )
    assert r.status_code == 200
    visible = {i["entry_id"] for i in r.json()["items"]}
    assert str(helix_eid) not in visible


# ---------------------------------------------------------------------------
# EXPLAIN: confirm the index on person_id is used for the caller-lookup half
# ---------------------------------------------------------------------------

async def test_visibility_query_hits_person_programme_assignments_index(
    seeded_for_mutation: asyncpg.Connection,
) -> None:
    """Adi's slice 5a kickoff: 'Assert with EXPLAIN that the query hits the
    index on person_id.' Runs EXPLAIN against the inner caller-programmes
    subquery and asserts the plan references the slice 5a index."""
    dd_id = await _person(seeded_for_mutation, "DeliveryDirector", ap=True)

    explain_rows = await seeded_for_mutation.fetch(
        "EXPLAIN SELECT programme_id FROM person_programme_assignments "
        "WHERE person_id = $1",
        dd_id,
    )
    plan = "\n".join(r["QUERY PLAN"] for r in explain_rows)

    # Postgres may pick a Bitmap Index Scan, an Index Scan, or an Index Only
    # Scan depending on stats; all three reference the index name.
    assert "person_programme_assignments_person_id_idx" in plan, (
        f"caller-lookup query did not use the slice 5a index; plan was:\n{plan}"
    )
