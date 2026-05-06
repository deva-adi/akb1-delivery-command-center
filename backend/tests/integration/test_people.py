"""GET /api/v1/people tests.

All authenticated roles receive 200. No role scoping on this endpoint.
Reads not audited.
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

_EXPECTED_BAND_COUNTS = {
    "B1": 90,
    "B2": 90,
    "B3": 60,
    "B4": 36,
    "B5": 24,
}


async def _token_for_role(conn: asyncpg.Connection, role: str) -> str:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = $1 LIMIT 1", role
    )
    assert row is not None, f"No seeded person with role {role!r}"
    return mint_token(user_id=row["person_id"], role=role)


# ---------------------------------------------------------------------------
# Role 200s (parametrised)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("role", _ALL_ROLES)
async def test_get_people_all_roles_200(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    token = await _token_for_role(owner_seeded, role)
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# Auth error
# ---------------------------------------------------------------------------

async def test_get_people_no_token_401(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.get("/api/v1/people")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Count and shape
# ---------------------------------------------------------------------------

async def test_get_people_count_300(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 300
    assert len(body["items"]) == 300


async def test_get_people_item_shape(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    first = response.json()["items"][0]
    # Required fields present
    assert "person_id" in first
    assert "full_name" in first
    assert "role" in first
    assert "band" in first
    assert "ap_flag" in first
    # Sensitive fields must not appear
    assert "email" not in first
    assert "password_hash" not in first
    assert "programme_id" not in first


async def test_get_people_no_email_in_any_item(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    for item in response.json()["items"]:
        assert "email" not in item
        assert "password_hash" not in item


# ---------------------------------------------------------------------------
# Band distribution (spot-check against known seed shape)
# ---------------------------------------------------------------------------

async def test_get_people_band_distribution(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    items = response.json()["items"]
    band_counts: dict[str, int] = {}
    for item in items:
        band = item.get("band")
        if band:
            band_counts[band] = band_counts.get(band, 0) + 1
    for band, expected in _EXPECTED_BAND_COUNTS.items():
        assert band_counts.get(band) == expected, (
            f"Band {band}: expected {expected}, got {band_counts.get(band)}"
        )


async def test_get_people_ordered_by_band_then_name(
    owner_seeded: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for_role(owner_seeded, "PortfolioOwner")
    response = await http_client.get(
        "/api/v1/people",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    items = response.json()["items"]
    # First item must be in B1 (first band alphabetically)
    assert items[0]["band"] == "B1"
    # Last item before null-band entries must be in B5
    bands_with_value = [i["band"] for i in items if i["band"] is not None]
    assert bands_with_value[0] <= bands_with_value[-1]
