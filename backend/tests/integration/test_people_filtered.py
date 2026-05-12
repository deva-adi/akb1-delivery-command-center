"""GET /api/v1/people with filter params -- integration tests (M10-1).

Covers: ?band=, ?programme=, ?role=, no params (regression), combinations.
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


async def test_people_no_filter_still_300(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 300


async def test_people_filter_by_band_b3(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people?band=B3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 60
    for item in body["items"]:
        assert item["band"] == "B3"


async def test_people_filter_by_band_b1(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people?band=B1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 90


async def test_people_filter_by_programme_pegasus(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people?programme=PEGASUS",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["count"] > 0
    assert body["count"] < 300


async def test_people_filter_programme_band_combination(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r_all = await http_client.get(
        "/api/v1/people?programme=PEGASUS",
        headers={"Authorization": f"Bearer {token}"},
    )
    r_band = await http_client.get(
        "/api/v1/people?programme=PEGASUS&band=B3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_all.status_code == 200
    assert r_band.status_code == 200
    all_count = r_all.json()["count"]
    band_count = r_band.json()["count"]
    assert band_count <= all_count
    for item in r_band.json()["items"]:
        assert item["band"] == "B3"


async def test_people_unknown_band_returns_empty(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people?band=B9",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["count"] == 0


async def test_people_filter_by_role(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/people?role=ProgrammeManager",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["count"] > 0
    for item in body["items"]:
        assert item["role"] == "ProgrammeManager"


async def test_people_filter_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/people?band=B3")
    assert r.status_code == 401
