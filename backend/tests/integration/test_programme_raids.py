"""GET /api/v1/programmes/{code}/raids -- integration tests (slice M7-2).

Role access:
  PO/HRBP/RO: unrestricted (any programme)
  DD/FL/PM:   scoped to person_programme_assignments
  Any role:   404 on unknown code
"""

from __future__ import annotations

import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token


pytestmark = pytest.mark.integration


async def _person_id_by_role(conn: asyncpg.Connection, role: str) -> uuid.UUID:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = $1 LIMIT 1", role
    )
    return row["person_id"]


async def _first_assigned_programme(
    conn: asyncpg.Connection, person_id: uuid.UUID
) -> str:
    row = await conn.fetchrow(
        "SELECT programme_id FROM person_programme_assignments "
        "WHERE person_id = $1 LIMIT 1",
        person_id,
    )
    return row["programme_id"]


async def _unassigned_programme(
    conn: asyncpg.Connection, person_id: uuid.UUID
) -> str:
    row = await conn.fetchrow(
        "SELECT programme_code FROM programmes "
        "WHERE programme_code NOT IN ("
        "  SELECT programme_id FROM person_programme_assignments WHERE person_id = $1"
        ") LIMIT 1",
        person_id,
    )
    return row["programme_code"]


# ---------------------------------------------------------------------------
# Unrestricted roles
# ---------------------------------------------------------------------------

async def test_raids_po_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id = await _person_id_by_role(owner_seeded, "PortfolioOwner")
    token = mint_token(user_id=po_id, role="PortfolioOwner")

    r = await http_client.get(
        "/api/v1/programmes/PEGASUS/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert body["count"] == 15
    item = body["items"][0]
    for field in ("raid_id", "programme_code", "raid_type", "title", "severity", "status", "raised_date"):
        assert field in item


async def test_raids_hrbp_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    hrbp_id = await _person_id_by_role(owner_seeded, "HRBusinessPartner")
    token = mint_token(user_id=hrbp_id, role="HRBusinessPartner")

    r = await http_client.get(
        "/api/v1/programmes/ORION/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 15


async def test_raids_ro_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    ro_id = await _person_id_by_role(owner_seeded, "ReadOnly")
    token = mint_token(user_id=ro_id, role="ReadOnly")

    r = await http_client.get(
        "/api/v1/programmes/ATLAS/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 15


# ---------------------------------------------------------------------------
# Scoped roles -- DD
# ---------------------------------------------------------------------------

async def test_raids_dd_assigned_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    dd_id = await _person_id_by_role(owner_seeded, "DeliveryDirector")
    assigned_code = await _first_assigned_programme(owner_seeded, dd_id)
    token = mint_token(user_id=dd_id, role="DeliveryDirector")

    r = await http_client.get(
        f"/api/v1/programmes/{assigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 15


async def test_raids_dd_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    dd_id = await _person_id_by_role(owner_seeded, "DeliveryDirector")
    unassigned_code = await _unassigned_programme(owner_seeded, dd_id)
    token = mint_token(user_id=dd_id, role="DeliveryDirector")

    r = await http_client.get(
        f"/api/v1/programmes/{unassigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# Scoped roles -- FL
# ---------------------------------------------------------------------------

async def test_raids_fl_assigned_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fl_id = await _person_id_by_role(owner_seeded, "FinanceLead")
    assigned_code = await _first_assigned_programme(owner_seeded, fl_id)
    token = mint_token(user_id=fl_id, role="FinanceLead")

    r = await http_client.get(
        f"/api/v1/programmes/{assigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_raids_fl_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fl_id = await _person_id_by_role(owner_seeded, "FinanceLead")
    unassigned_code = await _unassigned_programme(owner_seeded, fl_id)
    token = mint_token(user_id=fl_id, role="FinanceLead")

    r = await http_client.get(
        f"/api/v1/programmes/{unassigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# Scoped roles -- PM
# ---------------------------------------------------------------------------

async def test_raids_pm_own_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    pm_id = await _person_id_by_role(owner_seeded, "ProgrammeManager")
    assigned_code = await _first_assigned_programme(owner_seeded, pm_id)
    token = mint_token(user_id=pm_id, role="ProgrammeManager")

    r = await http_client.get(
        f"/api/v1/programmes/{assigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_raids_pm_other_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    pm_id = await _person_id_by_role(owner_seeded, "ProgrammeManager")
    unassigned_code = await _unassigned_programme(owner_seeded, pm_id)
    token = mint_token(user_id=pm_id, role="ProgrammeManager")

    r = await http_client.get(
        f"/api/v1/programmes/{unassigned_code}/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# Error paths
# ---------------------------------------------------------------------------

async def test_raids_unknown_code_404(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id = await _person_id_by_role(owner_seeded, "PortfolioOwner")
    token = mint_token(user_id=po_id, role="PortfolioOwner")

    r = await http_client.get(
        "/api/v1/programmes/DOESNOTEXIST/raids",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


async def test_raids_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/programmes/PEGASUS/raids")
    assert r.status_code == 401
