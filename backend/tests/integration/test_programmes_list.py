"""GET /api/v1/programmes -- integration tests (M10-1).

Covers: list all programmes with health state, role access, response shape.
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token

pytestmark = pytest.mark.integration

_ALL_ROLES = [
    "PortfolioOwner",
    "DeliveryDirector",
    "ProgrammeManager",
    "FinanceLead",
    "HRBusinessPartner",
    "ReadOnly",
]

_EXPECTED_CODES = {
    "ANDROMEDA", "ATLAS", "DRACO", "HELIX", "LYRA",
    "ORION", "PEGASUS", "PHOENIX", "STELLAR", "VEGA",
}


async def _token_for_role(conn: asyncpg.Connection, role: str) -> str:
    row = await conn.fetchrow("SELECT person_id FROM people WHERE role = $1 LIMIT 1", role)
    assert row is not None
    return mint_token(user_id=row["person_id"], role=role)


@pytest.mark.parametrize("role", _ALL_ROLES)
async def test_list_programmes_all_roles_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    token = await _token_for_role(owner_seeded, role)
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200


async def test_list_programmes_count_10(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 10
    assert len(body["items"]) == 10


async def test_list_programmes_codes_match_seed(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    codes = {item["programme_code"] for item in r.json()["items"]}
    assert codes == _EXPECTED_CODES


async def test_list_programmes_item_shape(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    item = r.json()["items"][0]
    assert "programme_code" in item
    assert "programme_name" in item
    assert "health_state" in item


async def test_list_programmes_health_state_is_rag_or_none(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    valid_states = {"Red", "Amber", "Green", "Watching", "Failing", None}
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    for item in r.json()["items"]:
        assert item["health_state"] in valid_states


async def test_list_programmes_ordered_alphabetically(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    r = await http_client.get(
        "/api/v1/programmes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    codes = [item["programme_code"] for item in r.json()["items"]]
    assert codes == sorted(codes)


async def test_list_programmes_no_token_401(
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/programmes")
    assert r.status_code == 401
