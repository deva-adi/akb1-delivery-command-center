"""GET /api/v1/audit/entry/{entry_id} integration tests.

Slice 5c. Covers:
  - PO + AP=true:        200 with full body and computed diff.
  - DD + AP=true:        200.
  - FL + AP=true:        200 (sanity).
  - PO + AP=false:       403 ApFlagDenied (strict_ap removes PO carve-out).
  - DD + AP=false:       403 ApFlagDenied.
  - HRBP, PM, RO:        403 RoleDenied.
  - No token:            401.
  - Invalid token:       401.
  - Unknown entry_id:    404, no audit row written.
  - Successful read:     no audit row appended.
  - diff null when before_json is null.
  - diff null when after_json is null.
  - diff null when both are null.
  - diff added / removed / changed populated correctly when both present.
  - E2E: login as PO+AP=true, /audit/search to grab an entry_id, then
    /audit/entry/{id}, full shape assertions.
  - Shallow diff unit-style: the service helper compute_shallow_diff
    against constructed dicts (no DB).
"""

from __future__ import annotations

import datetime
import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token
from app.services.audit_entry import compute_shallow_diff


pytestmark = pytest.mark.integration


# Helpers ------------------------------------------------------------

async def _person(
    conn: asyncpg.Connection, role: str, ap: bool | None = None
) -> tuple[uuid.UUID, str]:
    if ap is None:
        row = await conn.fetchrow(
            "SELECT person_id, email FROM people WHERE role = $1 LIMIT 1", role
        )
    else:
        row = await conn.fetchrow(
            "SELECT person_id, email FROM people WHERE role = $1 AND ap_flag = $2 LIMIT 1",
            role,
            ap,
        )
    assert row is not None, f"seed missing role={role} ap={ap}"
    return row["person_id"], row["email"]


async def _token_for(
    conn: asyncpg.Connection, role: str, ap: bool | None = None
) -> str:
    person_id, _ = await _person(conn, role, ap)
    if ap is None:
        row = await conn.fetchrow(
            "SELECT ap_flag FROM people WHERE person_id = $1", person_id
        )
        ap_flag = row["ap_flag"]
    else:
        ap_flag = ap
    return mint_token(user_id=person_id, role=role, ap_flag=ap_flag)


async def _insert_audit_row(
    conn: asyncpg.Connection,
    *,
    actor_user_id: uuid.UUID,
    actor_role: str = "PortfolioOwner",
    endpoint: str = "/api/v1/admin/tier-config/3",
    http_method: str = "PATCH",
    outcome: str = "Success",
    resource_type: str = "escalation_tier_config",
    resource_id: uuid.UUID | None = None,
    before_json: dict | None = None,
    after_json: dict | None = None,
) -> uuid.UUID:
    """Insert one row directly via owner connection. Returns entry_id."""
    import json as _json

    entry_id = uuid.uuid4()
    occurred_at = datetime.datetime.now(datetime.timezone.utc)
    await conn.execute(
        """
        INSERT INTO audit_trail_entries (
            entry_id, actor_user_id, actor_role, endpoint, http_method,
            occurred_at, outcome, resource_type, resource_id,
            before_json, after_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb)
        """,
        entry_id,
        actor_user_id,
        actor_role,
        endpoint,
        http_method,
        occurred_at,
        outcome,
        resource_type,
        resource_id,
        _json.dumps(before_json) if before_json is not None else None,
        _json.dumps(after_json) if after_json is not None else None,
    )
    return entry_id


# 1. Allowed paths ---------------------------------------------------

async def test_entry_po_with_ap_returns_200_with_diff(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"display_label": "Tier 3", "tier_number": 3, "active": True},
        after_json={"display_label": "Tier 3 Renamed", "tier_number": 3, "owner": "po"},
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["entry_id"] == str(entry_id)
    assert body["actor_user_id"] == str(po_id)
    assert body["http_method"] == "PATCH"
    assert body["resource_type"] == "escalation_tier_config"
    assert body["outcome"] == "Success"
    assert body["before_json"] == {"display_label": "Tier 3", "tier_number": 3, "active": True}
    assert body["after_json"] == {"display_label": "Tier 3 Renamed", "tier_number": 3, "owner": "po"}

    diff = body["diff"]
    assert diff is not None
    assert diff["added"] == {"owner": "po"}
    assert diff["removed"] == {"active": True}
    assert diff["changed"] == {
        "display_label": {"before": "Tier 3", "after": "Tier 3 Renamed"}
    }


async def test_entry_dd_with_ap_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    token = await _token_for(seeded_for_mutation, "DeliveryDirector", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text


async def test_entry_fl_with_ap_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    token = await _token_for(seeded_for_mutation, "FinanceLead", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text


# 2. ApFlagDenied path -----------------------------------------------

async def test_entry_po_without_ap_returns_403_apflagdenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Strict mode removes the PO carve-out. PO+AP=false is denied here."""
    # Manufacture a PO without AP. The seed has only one PO and AP=true on it.
    po_no_ap_id = uuid.uuid4()
    await seeded_for_mutation.execute(
        "INSERT INTO people (person_id, email, full_name, role, ap_flag, password_hash) "
        "VALUES ($1, $2, $3, $4, $5, $6)",
        po_no_ap_id, f"po-no-ap-{uuid.uuid4().hex}@test.local", "PO No AP",
        "PortfolioOwner", False, "",
    )
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_no_ap_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    token = mint_token(user_id=po_no_ap_id, role="PortfolioOwner", ap_flag=False)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403, r.text
    assert r.json()["detail"] == "Audit Permission required"

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before + 1
    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome, resource_type, actor_role "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "ApFlagDenied"
    assert last["resource_type"] == "audit_entry"
    assert last["actor_role"] == "PortfolioOwner"


async def test_entry_dd_without_ap_returns_403_apflagdenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    dd_no_ap_id, _ = await _person(seeded_for_mutation, "DeliveryDirector", ap=False)
    token = mint_token(user_id=dd_no_ap_id, role="DeliveryDirector", ap_flag=False)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "Audit Permission required"

    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome, resource_type FROM audit_trail_entries "
        "ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "ApFlagDenied"
    assert last["resource_type"] == "audit_entry"


# 3. RoleDenied path -------------------------------------------------

@pytest.mark.parametrize("role", ["ProgrammeManager", "HRBusinessPartner", "ReadOnly"])
async def test_entry_disallowed_role_returns_403_roledenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    user_id, _ = await _person(seeded_for_mutation, role)
    token = mint_token(user_id=user_id, role=role, ap_flag=False)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
    assert "not authorised" in r.json()["detail"].lower()

    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome, resource_type, actor_role FROM audit_trail_entries "
        "ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "RoleDenied"
    assert last["resource_type"] == "audit_entry"
    assert last["actor_role"] == role


# 4. Auth errors -----------------------------------------------------

async def test_entry_no_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fake_id = uuid.uuid4()
    r = await http_client.get(f"/api/v1/audit/entry/{fake_id}")
    assert r.status_code == 401


async def test_entry_invalid_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fake_id = uuid.uuid4()
    r = await http_client.get(
        f"/api/v1/audit/entry/{fake_id}",
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert r.status_code == 401


# 5. 404 -------------------------------------------------------------

async def test_entry_unknown_id_returns_404_no_audit(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Unknown entry_id returns 404 and writes no audit row.

    The require_audit_access dependency runs first (it succeeds for an
    AP-true caller). Only then does the service raise 404. Reads are not
    audited on success or on a not-found per D-039 ruling 8.
    """
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    fake_id = uuid.uuid4()
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    r = await http_client.get(
        f"/api/v1/audit/entry/{fake_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404
    assert "not found" in r.json()["detail"].lower()

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before, "404 must not write an audit row"


# 6. Successful read does not audit ----------------------------------

async def test_entry_successful_read_does_not_write_audit(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"x": 1},
        after_json={"x": 2},
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before, "successful read must not write an audit row"


# 7. Diff null cases -------------------------------------------------

async def test_entry_diff_null_when_before_json_null(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json=None,
        after_json={"reason": "ap_flag_required"},
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["before_json"] is None
    assert body["after_json"] == {"reason": "ap_flag_required"}
    assert body["diff"] is None


async def test_entry_diff_null_when_after_json_null(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"display_label": "Tier 3"},
        after_json=None,
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["before_json"] == {"display_label": "Tier 3"}
    assert body["after_json"] is None
    assert body["diff"] is None


async def test_entry_diff_null_when_both_snapshots_null(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json=None,
        after_json=None,
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["diff"] is None


# 8. Diff identical snapshots ----------------------------------------

async def test_entry_diff_empty_when_snapshots_identical(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Diff is non-null but all sections empty when before == after."""
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    payload = {"display_label": "Tier 3", "tier_number": 3}
    entry_id = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json=payload,
        after_json=payload,
    )
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        f"/api/v1/audit/entry/{entry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    diff = r.json()["diff"]
    assert diff is not None
    assert diff["added"] == {}
    assert diff["removed"] == {}
    assert diff["changed"] == {}


# 9. compute_shallow_diff helper (no DB) -----------------------------

def test_compute_shallow_diff_added_only() -> None:
    d = compute_shallow_diff({"a": 1}, {"a": 1, "b": 2})
    assert d is not None
    assert d.added == {"b": 2}
    assert d.removed == {}
    assert d.changed == {}


def test_compute_shallow_diff_removed_only() -> None:
    d = compute_shallow_diff({"a": 1, "b": 2}, {"a": 1})
    assert d is not None
    assert d.added == {}
    assert d.removed == {"b": 2}
    assert d.changed == {}


def test_compute_shallow_diff_changed_only() -> None:
    d = compute_shallow_diff({"a": 1}, {"a": 2})
    assert d is not None
    assert d.added == {}
    assert d.removed == {}
    assert d.changed == {"a": {"before": 1, "after": 2}}


def test_compute_shallow_diff_mixed() -> None:
    d = compute_shallow_diff(
        {"a": 1, "b": 2, "c": 3},
        {"a": 1, "b": 99, "d": 4},
    )
    assert d is not None
    assert d.added == {"d": 4}
    assert d.removed == {"c": 3}
    assert d.changed == {"b": {"before": 2, "after": 99}}


def test_compute_shallow_diff_returns_none_on_null_before() -> None:
    assert compute_shallow_diff(None, {"a": 1}) is None


def test_compute_shallow_diff_returns_none_on_null_after() -> None:
    assert compute_shallow_diff({"a": 1}, None) is None


def test_compute_shallow_diff_shallow_only_nested_objects_treated_as_values() -> None:
    """Nested object change is reported at top level only; no recursion."""
    d = compute_shallow_diff(
        {"meta": {"k": 1}},
        {"meta": {"k": 2}},
    )
    assert d is not None
    assert d.added == {}
    assert d.removed == {}
    assert d.changed == {
        "meta": {"before": {"k": 1}, "after": {"k": 2}}
    }


# 10. E2E ------------------------------------------------------------

async def test_entry_e2e_login_search_then_entry(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Login as PO+AP=true, hit /audit/search to grab a real entry_id, fetch
    the entry detail. Validates the production token flow against the new
    endpoint and asserts the full response shape."""
    # Seed an audit row to find via search.
    po_id, po_email = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    seeded_entry = await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        before_json={"display_label": "Tier 3", "tier_number": 3},
        after_json={"display_label": "Tier 3 Updated", "tier_number": 3, "by": "po"},
    )

    # Real login.
    login_r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": "akb1_demo_password"},
    )
    assert login_r.status_code == 200, login_r.text
    token = login_r.json()["access_token"]
    # Sync CSRF cookie for any subsequent mutating call (not needed for GETs
    # but matches the slice 5b pattern).
    csrf_value = login_r.cookies.get("csrf_token")
    if csrf_value:
        http_client.headers["X-CSRF-Token"] = csrf_value

    # Search and confirm the seeded row is visible.
    search_r = await http_client.get(
        "/api/v1/audit/search?resource_type=escalation_tier_config",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert search_r.status_code == 200, search_r.text
    items = search_r.json()["items"]
    found_id = next(
        (it["entry_id"] for it in items if it["entry_id"] == str(seeded_entry)),
        None,
    )
    assert found_id is not None, "seeded audit row missing from search results"

    # Fetch entry detail.
    detail_r = await http_client.get(
        f"/api/v1/audit/entry/{found_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert detail_r.status_code == 200, detail_r.text
    body = detail_r.json()

    expected_keys = {
        "entry_id", "occurred_at", "actor_user_id", "actor_role",
        "http_method", "endpoint", "resource_type", "resource_id",
        "outcome", "ip_address", "before_json", "after_json", "diff",
    }
    assert set(body.keys()) == expected_keys
    assert body["entry_id"] == str(seeded_entry)
    assert body["before_json"] == {"display_label": "Tier 3", "tier_number": 3}
    assert body["after_json"] == {
        "display_label": "Tier 3 Updated", "tier_number": 3, "by": "po"
    }
    assert body["diff"]["added"] == {"by": "po"}
    assert body["diff"]["removed"] == {}
    assert body["diff"]["changed"] == {
        "display_label": {"before": "Tier 3", "after": "Tier 3 Updated"}
    }
