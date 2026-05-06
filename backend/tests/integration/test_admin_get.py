"""GET /api/v1/admin/tier-config and /api/v1/admin/threshold-register tests.

Slice 3.3. PO-only reads. Wrapped list response shape {"items": [...]}.
No audit (reads not audited per spec).
"""

from __future__ import annotations

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
    return row["person_id"]


async def _po_token(conn: asyncpg.Connection) -> str:
    po_id = await _person_id_by_role(conn, "PortfolioOwner")
    return mint_token(user_id=po_id, role="PortfolioOwner")


# ---------------------------------------------------------------------------
# GET /api/v1/admin/tier-config
# ---------------------------------------------------------------------------

async def test_get_tier_config_list_po_returns_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(owner_seeded)

    response = await http_client.get(
        "/api/v1/admin/tier-config",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert len(body["items"]) == 5
    # Tier numbers in order
    assert [r["tier_number"] for r in body["items"]] == [1, 2, 3, 4, 5]
    assert [r["default_label"] for r in body["items"]] == [
        "DM", "Programme Director", "Portfolio Owner", "Sponsor", "Steerco",
    ]


@pytest.mark.parametrize("role", _NON_PO_ROLES)
async def test_get_tier_config_list_non_po_returns_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    user_id = await _person_id_by_role(owner_seeded, role)
    token = mint_token(user_id=user_id, role=role)

    response = await http_client.get(
        "/api/v1/admin/tier-config",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


async def test_get_tier_config_list_no_token_returns_401(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.get("/api/v1/admin/tier-config")
    assert response.status_code == 401


async def test_get_tier_config_does_not_write_audit(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Reads are not audited per spec. audit_trail_entries count unchanged."""
    token = await _po_token(owner_seeded)
    n_before = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.get(
        "/api/v1/admin/tier-config",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    n_after = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before


# ---------------------------------------------------------------------------
# GET /api/v1/admin/threshold-register
# ---------------------------------------------------------------------------

async def test_get_threshold_register_list_po_returns_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(owner_seeded)

    response = await http_client.get(
        "/api/v1/admin/threshold-register",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert len(body["items"]) == 60
    # Spot-check a known metric
    margin_row = next(
        r for r in body["items"] if r["metric_id"] == "portfolio_margin_pct"
    )
    assert margin_row["direction"] == "HigherIsBetter"
    assert margin_row["owning_role"] == "FinanceLead"


@pytest.mark.parametrize("role", _NON_PO_ROLES)
async def test_get_threshold_register_list_non_po_returns_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    user_id = await _person_id_by_role(owner_seeded, role)
    token = mint_token(user_id=user_id, role=role)

    response = await http_client.get(
        "/api/v1/admin/threshold-register",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


async def test_get_threshold_register_list_no_token_returns_401(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.get("/api/v1/admin/threshold-register")
    assert response.status_code == 401


async def test_get_threshold_register_does_not_write_audit(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _po_token(owner_seeded)
    n_before = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.get(
        "/api/v1/admin/threshold-register",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    n_after = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before
