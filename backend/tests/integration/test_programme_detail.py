"""GET /api/v1/programmes/{code} -- integration tests (M10-1).

Covers: single programme detail, role scoping, 404 on unknown code.
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token

pytestmark = pytest.mark.integration


async def _token_for_role(conn: asyncpg.Connection, role: str) -> str:
    row = await conn.fetchrow("SELECT person_id FROM people WHERE role = $1 LIMIT 1", role)
    assert row is not None
    return mint_token(user_id=row["person_id"], role=role)


async def _first_assigned_programme(conn: asyncpg.Connection, person_id) -> str:
    row = await conn.fetchrow(
        "SELECT programme_id FROM person_programme_assignments WHERE person_id = $1 LIMIT 1",
        person_id,
    )
    return row["programme_id"]


async def _unassigned_programme(conn: asyncpg.Connection, person_id) -> str:
    row = await conn.fetchrow(
        "SELECT programme_code FROM programmes "
        "WHERE programme_code NOT IN ("
        "  SELECT programme_id FROM person_programme_assignments WHERE person_id = $1"
        ") LIMIT 1",
        person_id,
    )
    return row["programme_code"]


async def test_programme_detail_po_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes/PEGASUS",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["programme_code"] == "PEGASUS"
    assert "programme_name" in body
    assert "health_state" in body
    assert "raid_summary" in body
    assert "milestone_summary" in body
    assert "latest_snapshot_at" in body


async def test_programme_detail_raid_summary_shape(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes/PEGASUS",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    raid = r.json()["raid_summary"]
    assert "total" in raid
    assert "by_type" in raid
    assert "by_severity" in raid
    assert raid["total"] == 15


async def test_programme_detail_milestone_summary_shape(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes/PEGASUS",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    ms = r.json()["milestone_summary"]
    assert "total" in ms
    assert "completed" in ms
    assert "on_time_pct" in ms
    assert ms["total"] == 20


async def test_programme_detail_dd_assigned_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    row = await owner_seeded.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' LIMIT 1"
    )
    person_id = row["person_id"]
    assigned_code = await _first_assigned_programme(owner_seeded, person_id)
    token = mint_token(user_id=person_id, role="DeliveryDirector")
    r = await http_client.get(
        f"/api/v1/programmes/{assigned_code}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_programme_detail_dd_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    row = await owner_seeded.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' LIMIT 1"
    )
    person_id = row["person_id"]
    unassigned_code = await _unassigned_programme(owner_seeded, person_id)
    token = mint_token(user_id=person_id, role="DeliveryDirector")
    r = await http_client.get(
        f"/api/v1/programmes/{unassigned_code}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


async def test_programme_detail_unknown_404(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes/DOESNOTEXIST",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


async def test_programme_detail_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/programmes/PEGASUS")
    assert r.status_code == 401
