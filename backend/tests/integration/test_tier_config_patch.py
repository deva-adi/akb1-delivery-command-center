"""PATCH /api/v1/admin/tier-config/{tier_number} integration tests.

Covers all five slice 2.5 invariants:

  1. Contract: 200 for PortfolioOwner; 403 for every other role; 401 unauth.
  2. Audit invariant: count(audit_trail_entries) increments by exactly 1.
  3. Snapshot: before_json and after_json populated as full row state per
     Q4 Option A. Every column present in both snapshots.
  4. Q1 acceptance: PATCH then read back returns the new display_label
     while default_label remains untouched.
  5. Atomic rollback: when the audit writer raises mid-transaction, the
     UPDATE rolls back and no audit row persists.
"""

from __future__ import annotations

import json
import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token


pytestmark = pytest.mark.integration


_NON_PO_ROLES = [
    "DeliveryDirector",
    "ProgrammeManager",
    "FinanceLead",
    "HRBusinessPartner",
    "ReadOnly",
]


async def _person_id_by_role(conn: asyncpg.Connection, role: str) -> uuid.UUID:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = $1 LIMIT 1", role
    )
    assert row is not None, f"seed missing role {role}"
    return row["person_id"]


async def _po_token(conn: asyncpg.Connection) -> str:
    po_id = await _person_id_by_role(conn, "PortfolioOwner")
    return mint_token(user_id=po_id, role="PortfolioOwner")


# ---------------------------------------------------------------------------
# 1. Contract: PO 200, non-PO 403, no token 401
# ---------------------------------------------------------------------------

async def test_patch_tier_config_po_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Delivery Director"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["tier_number"] == 2
    assert body["display_label"] == "Delivery Director"
    assert body["default_label"] == "Programme Director"


@pytest.mark.parametrize("role", _NON_PO_ROLES)
async def test_patch_tier_config_non_po_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    user_id = await _person_id_by_role(seeded_for_mutation, role)
    token = mint_token(user_id=user_id, role=role)

    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Should Not Apply"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403, (
        f"role {role} should be forbidden, got {response.status_code}: {response.text}"
    )


async def test_patch_tier_config_no_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "X"},
    )
    assert response.status_code == 401


async def test_patch_tier_config_invalid_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "X"},
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert response.status_code == 401


async def test_patch_tier_config_empty_body_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


async def test_patch_tier_config_unknown_field_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "X", "unknown_field": "ignored"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


async def test_patch_tier_config_unknown_tier_returns_404(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        "/api/v1/admin/tier-config/9",
        json={"display_label": "X"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# 2. Audit invariant: count(audit_trail_entries) goes up by exactly 1
# ---------------------------------------------------------------------------

async def test_audit_invariant_count_increments_by_one(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.patch(
        "/api/v1/admin/tier-config/3",
        json={"display_label": "Senior Sponsor"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before + 1


# ---------------------------------------------------------------------------
# 3. Snapshot: before_json and after_json full row state per Q4 Option A
# ---------------------------------------------------------------------------

async def test_audit_snapshot_full_state_not_diff(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Delivery Director"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    row = await seeded_for_mutation.fetchrow(
        "SELECT actor_user_id, actor_role, endpoint, http_method, "
        "resource_type, before_json, after_json, outcome "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert row is not None

    assert row["actor_role"] == "PortfolioOwner"
    assert row["http_method"] == "PATCH"
    assert row["resource_type"] == "escalation_tier_config"
    assert row["endpoint"] == "/api/v1/admin/tier-config/2"
    assert row["outcome"] == "Success"

    before = json.loads(row["before_json"])
    after = json.loads(row["after_json"])

    expected_keys = {
        "tier_number",
        "default_label",
        "display_label",
        "description_text",
        "sla_hint_hours",
        "role_mapping",
        "active",
        "last_edited_at",
        "last_edited_by_user_id",
    }
    assert set(before.keys()) == expected_keys, (
        f"before_json missing: {expected_keys - set(before.keys())}"
    )
    assert set(after.keys()) == expected_keys, (
        f"after_json missing: {expected_keys - set(after.keys())}"
    )

    # The PATCH changed display_label only; default_label is the canonical
    # factory string and never changes through this endpoint.
    assert before["display_label"] == "Programme Director"
    assert after["display_label"] == "Delivery Director"
    assert before["default_label"] == "Programme Director"
    assert after["default_label"] == "Programme Director"
    assert before["tier_number"] == 2
    assert after["tier_number"] == 2


# ---------------------------------------------------------------------------
# 4. Q1 acceptance: PATCH then GET returns the new label
# ---------------------------------------------------------------------------

async def test_q1_propagation_read_back_returns_new_label(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    initial = await seeded_for_mutation.fetchrow(
        "SELECT display_label, default_label "
        "FROM escalation_tier_config WHERE tier_number = 2"
    )
    assert initial["display_label"] == "Programme Director"
    assert initial["default_label"] == "Programme Director"

    response = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Renamed Director"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    after = await seeded_for_mutation.fetchrow(
        "SELECT display_label, default_label "
        "FROM escalation_tier_config WHERE tier_number = 2"
    )
    assert after["display_label"] == "Renamed Director"
    # Per Q1 ruling: default_label is immutable at the API level
    assert after["default_label"] == "Programme Director"


# ---------------------------------------------------------------------------
# 5. Atomic rollback: audit failure rolls back the UPDATE; no audit row
# ---------------------------------------------------------------------------

async def test_atomic_rollback_when_audit_fails(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Override get_audit_writer with a failing implementation. Issue
    the PATCH. Confirm the UPDATE rolled back and no audit row persists."""
    from app.api.v1.admin import get_audit_writer  # noqa: PLC0415
    from app.main import app  # noqa: PLC0415

    async def _failing_audit_writer(*args, **kwargs):
        raise RuntimeError("simulated audit failure for atomic rollback test")

    app.dependency_overrides[get_audit_writer] = lambda: _failing_audit_writer

    token = await _po_token(seeded_for_mutation)
    label_before = await seeded_for_mutation.fetchval(
        "SELECT display_label FROM escalation_tier_config WHERE tier_number = 4"
    )
    assert label_before == "Sponsor"
    n_audit_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    # The endpoint will raise inside session.begin(); FastAPI converts
    # to a 500. We do not assert the body shape because the failure path
    # is intentionally bare; the assertions that matter are the DB state.
    response = await http_client.patch(
        "/api/v1/admin/tier-config/4",
        json={"display_label": "Executive Sponsor"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 500

    label_after = await seeded_for_mutation.fetchval(
        "SELECT display_label FROM escalation_tier_config WHERE tier_number = 4"
    )
    assert label_after == "Sponsor", (
        "UPDATE was not rolled back when the audit writer raised"
    )

    n_audit_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_audit_after == n_audit_before, (
        "an audit row was persisted despite the simulated failure"
    )
