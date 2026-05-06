"""PATCH /api/v1/admin/threshold-register/{metric_id} integration tests.

Same five invariants as the tier-config PATCH (slice 2.5):

  1. Contract: 200 for PortfolioOwner; 403 for every other role; 401 unauth.
  2. Audit invariant: count(audit_trail_entries) increments by exactly 1.
  3. Snapshot: before_json and after_json populated as full row state per
     Q4 Option A. Every column present in both snapshots; Decimal columns
     serialised as strings for clean JSON.
  4. Calibration acceptance: PATCH then read back returns the new threshold
     values; metric_id remains untouched.
  5. Atomic rollback: when the audit writer raises mid-transaction, the
     UPDATE rolls back and no audit row persists.
"""

from __future__ import annotations

import json
import uuid
from decimal import Decimal

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

# Two seeded metrics used as fixtures across the contract suite. Both come
# from Data Model PRD rev 4 section 5.2 and are present in the slice 2.4 seed.
METRIC_HIGHER = "portfolio_margin_pct"  # HigherIsBetter, green=28.0, amber=25.0
METRIC_RANGE = "tcpi"                    # RangeIsBetter, range_lower=0.95, range_upper=1.05


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
# 1. Contract: PO 200, non-PO 403, no token 401, bad body 422
# ---------------------------------------------------------------------------

async def test_patch_threshold_po_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "29.5", "rationale_text": "Recalibrated 2026-04-25"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["metric_id"] == METRIC_HIGHER
    assert Decimal(body["green_threshold"]) == Decimal("29.5")
    assert body["rationale_text"] == "Recalibrated 2026-04-25"
    assert body["direction"] == "HigherIsBetter"  # untouched


@pytest.mark.parametrize("role", _NON_PO_ROLES)
async def test_patch_threshold_non_po_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    user_id = await _person_id_by_role(seeded_for_mutation, role)
    token = mint_token(user_id=user_id, role=role)

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "30.0"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403, (
        f"role {role} should be forbidden, got {response.status_code}: {response.text}"
    )


async def test_patch_threshold_no_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "30.0"},
    )
    assert response.status_code == 401


async def test_patch_threshold_invalid_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "30.0"},
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert response.status_code == 401


async def test_patch_threshold_empty_body_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


async def test_patch_threshold_unknown_field_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "30.0", "metric_id": "tampered"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


async def test_patch_threshold_invalid_direction_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"direction": "MaybeBetter"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


async def test_patch_threshold_invalid_owning_role_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"owning_role": "DeliveryDirector"},
        headers={"Authorization": f"Bearer {token}"},
    )
    # DeliveryDirector is a valid people role but NOT a valid owning_role
    # for the threshold register (only PortfolioOwner / FinanceLead /
    # ProgrammeManager are accepted per section 4.31).
    assert response.status_code == 422


async def test_patch_threshold_unknown_metric_returns_404(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    response = await http_client.patch(
        "/api/v1/admin/threshold-register/this_metric_does_not_exist",
        json={"green_threshold": "30.0"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# 2. Audit invariant: count(audit_trail_entries) goes up by exactly 1
# ---------------------------------------------------------------------------

async def test_threshold_audit_invariant_count_increments_by_one(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "29.0"},
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

async def test_threshold_audit_snapshot_full_state_not_diff(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "29.5", "amber_threshold": "26.5"},
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
    assert row["resource_type"] == "threshold_calibration_register"
    assert row["endpoint"] == f"/api/v1/admin/threshold-register/{METRIC_HIGHER}"
    assert row["outcome"] == "Success"

    before = json.loads(row["before_json"])
    after = json.loads(row["after_json"])

    expected_keys = {
        "metric_id",
        "display_name",
        "direction",
        "green_threshold",
        "amber_threshold",
        "red_threshold",
        "range_lower",
        "range_upper",
        "rationale_text",
        "last_calibrated_at",
        "last_calibrated_by",
        "owning_role",
    }
    assert set(before.keys()) == expected_keys, (
        f"before_json missing: {expected_keys - set(before.keys())}"
    )
    assert set(after.keys()) == expected_keys, (
        f"after_json missing: {expected_keys - set(after.keys())}"
    )

    # The PATCH changed green and amber thresholds only.
    assert Decimal(before["green_threshold"]) == Decimal("28.00")
    assert Decimal(after["green_threshold"]) == Decimal("29.5")
    assert Decimal(before["amber_threshold"]) == Decimal("25.00")
    assert Decimal(after["amber_threshold"]) == Decimal("26.5")
    # Other numeric fields untouched
    assert before["red_threshold"] == after["red_threshold"]
    assert before["direction"] == after["direction"] == "HigherIsBetter"
    assert before["metric_id"] == after["metric_id"] == METRIC_HIGHER


async def test_threshold_audit_snapshot_handles_range_metric(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """RangeIsBetter metrics carry range_lower / range_upper as Decimal."""
    token = await _po_token(seeded_for_mutation)

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_RANGE}",
        json={"rationale_text": "TCPI band tightened post-incident review"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    row = await seeded_for_mutation.fetchrow(
        "SELECT before_json, after_json FROM audit_trail_entries "
        "ORDER BY occurred_at DESC LIMIT 1"
    )
    before = json.loads(row["before_json"])
    after = json.loads(row["after_json"])

    # Range fields are non-null for tcpi and Decimal-as-string in the snapshot
    assert before["range_lower"] is not None
    assert before["range_upper"] is not None
    assert Decimal(before["range_lower"]) == Decimal("0.95")
    assert Decimal(before["range_upper"]) == Decimal("1.05")
    # Snapshot fields preserved across the rationale-only update
    assert before["range_lower"] == after["range_lower"]
    assert before["range_upper"] == after["range_upper"]
    # Rationale is the diff
    assert before["rationale_text"] != after["rationale_text"]
    assert after["rationale_text"] == "TCPI band tightened post-incident review"


# ---------------------------------------------------------------------------
# 4. Calibration acceptance: PATCH then GET returns the new value
# ---------------------------------------------------------------------------

async def test_threshold_calibration_propagates_to_db(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(seeded_for_mutation)

    initial = await seeded_for_mutation.fetchrow(
        "SELECT green_threshold, amber_threshold "
        "FROM threshold_calibration_register WHERE metric_id = $1",
        METRIC_HIGHER,
    )
    assert initial["green_threshold"] == Decimal("28.00")

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "30.0"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    after = await seeded_for_mutation.fetchrow(
        "SELECT green_threshold, amber_threshold, last_calibrated_at, last_calibrated_by "
        "FROM threshold_calibration_register WHERE metric_id = $1",
        METRIC_HIGHER,
    )
    assert after["green_threshold"] == Decimal("30.0")
    # amber_threshold not touched
    assert after["amber_threshold"] == Decimal("25.00")
    # last_calibrated_by is the seeded PortfolioOwner who issued the PATCH
    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")
    assert after["last_calibrated_by"] == po_id


# ---------------------------------------------------------------------------
# 5. Atomic rollback: audit failure rolls back the UPDATE; no audit row
# ---------------------------------------------------------------------------

async def test_threshold_atomic_rollback_when_audit_fails(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    from app.api.v1.admin import get_audit_writer  # noqa: PLC0415
    from app.main import app  # noqa: PLC0415

    async def _failing_audit_writer(*args, **kwargs):
        raise RuntimeError("simulated audit failure for atomic rollback test")

    app.dependency_overrides[get_audit_writer] = lambda: _failing_audit_writer

    token = await _po_token(seeded_for_mutation)
    green_before = await seeded_for_mutation.fetchval(
        "SELECT green_threshold FROM threshold_calibration_register WHERE metric_id = $1",
        METRIC_HIGHER,
    )
    assert green_before == Decimal("28.00")
    n_audit_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.patch(
        f"/api/v1/admin/threshold-register/{METRIC_HIGHER}",
        json={"green_threshold": "99.0"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 500

    green_after = await seeded_for_mutation.fetchval(
        "SELECT green_threshold FROM threshold_calibration_register WHERE metric_id = $1",
        METRIC_HIGHER,
    )
    assert green_after == Decimal("28.00"), (
        "UPDATE was not rolled back when the audit writer raised"
    )
    n_audit_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_audit_after == n_audit_before, (
        "an audit row was persisted despite the simulated failure"
    )
