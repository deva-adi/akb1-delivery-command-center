"""GET /api/v1/programmes/{code}/health -- integration tests (slice M7-2).

Role access mirrors raids: PO/HRBP/RO unrestricted; DD/FL/PM scoped.
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


async def test_health_po_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id = await _person_id_by_role(owner_seeded, "PortfolioOwner")
    token = mint_token(user_id=po_id, role="PortfolioOwner")

    r = await http_client.get(
        "/api/v1/programmes/PEGASUS/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 4
    item = body["items"][0]
    for field in ("snapshot_id", "programme_code", "snapshot_date", "overall_rag", "captured_by_user_id"):
        assert field in item
    # newest snapshot first
    assert body["items"][0]["snapshot_date"] >= body["items"][-1]["snapshot_date"]


async def test_health_hrbp_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    hrbp_id = await _person_id_by_role(owner_seeded, "HRBusinessPartner")
    token = mint_token(user_id=hrbp_id, role="HRBusinessPartner")

    r = await http_client.get(
        "/api/v1/programmes/DRACO/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_health_ro_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    ro_id = await _person_id_by_role(owner_seeded, "ReadOnly")
    token = mint_token(user_id=ro_id, role="ReadOnly")

    r = await http_client.get(
        "/api/v1/programmes/LYRA/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_health_dd_assigned_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    dd_id = await _person_id_by_role(owner_seeded, "DeliveryDirector")
    code = await _first_assigned_programme(owner_seeded, dd_id)
    token = mint_token(user_id=dd_id, role="DeliveryDirector")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_health_dd_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    dd_id = await _person_id_by_role(owner_seeded, "DeliveryDirector")
    code = await _unassigned_programme(owner_seeded, dd_id)
    token = mint_token(user_id=dd_id, role="DeliveryDirector")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


async def test_health_fl_assigned_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fl_id = await _person_id_by_role(owner_seeded, "FinanceLead")
    code = await _first_assigned_programme(owner_seeded, fl_id)
    token = mint_token(user_id=fl_id, role="FinanceLead")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_health_fl_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fl_id = await _person_id_by_role(owner_seeded, "FinanceLead")
    code = await _unassigned_programme(owner_seeded, fl_id)
    token = mint_token(user_id=fl_id, role="FinanceLead")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


async def test_health_pm_own_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    pm_id = await _person_id_by_role(owner_seeded, "ProgrammeManager")
    code = await _first_assigned_programme(owner_seeded, pm_id)
    token = mint_token(user_id=pm_id, role="ProgrammeManager")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_health_pm_other_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    pm_id = await _person_id_by_role(owner_seeded, "ProgrammeManager")
    code = await _unassigned_programme(owner_seeded, pm_id)
    token = mint_token(user_id=pm_id, role="ProgrammeManager")

    r = await http_client.get(
        f"/api/v1/programmes/{code}/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


async def test_health_unknown_404(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id = await _person_id_by_role(owner_seeded, "PortfolioOwner")
    token = mint_token(user_id=po_id, role="PortfolioOwner")

    r = await http_client.get(
        "/api/v1/programmes/DOESNOTEXIST/health",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


async def test_health_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/programmes/PEGASUS/health")
    assert r.status_code == 401
