"""GET /api/v1/programmes/{code}/raids/{raid_id} -- integration tests (M10-1).

Covers: single RAID item detail, wrong programme 404, unknown id 404, role scoping.
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


async def _raid_id_for_programme(conn: asyncpg.Connection, code: str) -> str:
    row = await conn.fetchrow(
        "SELECT raid_id FROM programme_raids WHERE programme_code = $1 LIMIT 1", code
    )
    assert row is not None, f"No raids seeded for {code}"
    return str(row["raid_id"])


async def test_raid_detail_po_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    raid_id = await _raid_id_for_programme(owner_seeded, "PEGASUS")
    r = await http_client.get(
        f"/api/v1/programmes/PEGASUS/raids/{raid_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["raid_id"] == raid_id
    assert body["programme_code"] == "PEGASUS"
    for field in ("raid_type", "title", "severity", "status", "raised_date"):
        assert field in body


async def test_raid_detail_wrong_programme_404(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    pegasus_raid_id = await _raid_id_for_programme(owner_seeded, "PEGASUS")
    r = await http_client.get(
        f"/api/v1/programmes/ORION/raids/{pegasus_raid_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


async def test_raid_detail_unknown_id_404(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    unknown_id = "00000000-0000-0000-0000-000000000000"
    r = await http_client.get(
        f"/api/v1/programmes/PEGASUS/raids/{unknown_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404


async def test_raid_detail_dd_unassigned_403(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    row = await owner_seeded.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' LIMIT 1"
    )
    person_id = row["person_id"]
    unassigned_code = (
        await owner_seeded.fetchrow(
            "SELECT programme_code FROM programmes "
            "WHERE programme_code NOT IN ("
            "  SELECT programme_id FROM person_programme_assignments WHERE person_id = $1"
            ") LIMIT 1",
            person_id,
        )
    )["programme_code"]
    token = mint_token(user_id=person_id, role="DeliveryDirector")
    raid_id = await _raid_id_for_programme(owner_seeded, unassigned_code)
    r = await http_client.get(
        f"/api/v1/programmes/{unassigned_code}/raids/{raid_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


async def test_raid_detail_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/programmes/PEGASUS/raids/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 401
