"""CSRF middleware tests (slice 5b, item 3).

PRD 03 section 9 double-submit pattern. The middleware verifies on
mutating requests under /api/v1/* (excluding the login endpoint) that
the X-CSRF-Token header equals the csrf_token cookie. Login mints and
sets the cookie on its 2xx response.

Uses http_client_no_csrf fixture so the default-pre-seed in http_client
does not mask the assertions about missing or mismatched tokens.

Covers:
  1. PATCH with no header and no cookie -> 403.
  2. PATCH with cookie but no header -> 403.
  3. PATCH with header but no cookie -> 403.
  4. PATCH with mismatched cookie/header -> 403.
  5. PATCH with matching cookie/header -> reaches the route (200 or auth).
  6. GET is exempt regardless of CSRF state.
  7. POST /auth/login is exempt from verification (it is the issuance point).
  8. Login response sets a fresh csrf_token cookie with the right shape.
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token
from app.seed.generator import SEED_PASSWORD


pytestmark = pytest.mark.integration


async def _po_id(conn: asyncpg.Connection) -> str:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
    )
    return row["person_id"]


async def _po_email(conn: asyncpg.Connection) -> str:
    row = await conn.fetchrow(
        "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
    )
    return row["email"]


# ---------------------------------------------------------------------------
# 1. Missing both
# ---------------------------------------------------------------------------

async def test_patch_without_csrf_header_or_cookie_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    r = await http_client_no_csrf.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Should Not Apply"},
        headers={"Authorization": bearer},
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "CSRF token missing or invalid"


# ---------------------------------------------------------------------------
# 2. Cookie only
# ---------------------------------------------------------------------------

async def test_patch_with_cookie_but_no_header_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    http_client_no_csrf.cookies.set("csrf_token", "value-only-in-cookie")

    r = await http_client_no_csrf.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Should Not Apply"},
        headers={"Authorization": bearer},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 3. Header only
# ---------------------------------------------------------------------------

async def test_patch_with_header_but_no_cookie_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    r = await http_client_no_csrf.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Should Not Apply"},
        headers={
            "Authorization": bearer,
            "X-CSRF-Token": "header-only-no-matching-cookie",
        },
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 4. Mismatch
# ---------------------------------------------------------------------------

async def test_patch_with_mismatched_csrf_returns_403(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    http_client_no_csrf.cookies.set("csrf_token", "alpha")

    r = await http_client_no_csrf.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "Should Not Apply"},
        headers={"Authorization": bearer, "X-CSRF-Token": "bravo"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 5. Match -> reaches the route
# ---------------------------------------------------------------------------

async def test_patch_with_matching_csrf_passes_middleware(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    matched = "matched-csrf-token-value"
    http_client_no_csrf.cookies.set("csrf_token", matched)

    r = await http_client_no_csrf.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "CSRF Pass"},
        headers={"Authorization": bearer, "X-CSRF-Token": matched},
    )
    # Middleware passed; route handled normally.
    assert r.status_code == 200, r.text
    assert r.json()["display_label"] == "CSRF Pass"


# ---------------------------------------------------------------------------
# 6. GET is exempt
# ---------------------------------------------------------------------------

async def test_get_is_exempt_from_csrf(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    po_id = await _po_id(seeded_for_mutation)
    bearer = f"Bearer {mint_token(user_id=po_id, role='PortfolioOwner')}"

    # No cookie, no header. GET still returns 200.
    r = await http_client_no_csrf.get(
        "/api/v1/admin/tier-config",
        headers={"Authorization": bearer},
    )
    assert r.status_code == 200


# ---------------------------------------------------------------------------
# 7. POST /auth/login is exempt
# ---------------------------------------------------------------------------

async def test_login_post_is_exempt_from_csrf_verification(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    """No CSRF cookie / header on the login request itself; should still
    succeed because login is the token issuance point."""
    email = await _po_email(seeded_for_mutation)

    r = await http_client_no_csrf.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert r.status_code == 200, r.text


# ---------------------------------------------------------------------------
# 8. Login response sets the csrf_token cookie
# ---------------------------------------------------------------------------

async def test_login_response_sets_csrf_token_cookie(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)

    r = await http_client_no_csrf.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert r.status_code == 200
    cookie = r.cookies.get("csrf_token")
    assert cookie is not None
    # urlsafe base64 of 32 bytes, padding stripped, is 43 chars.
    assert len(cookie) == 43
    # Set-Cookie attributes carried through
    set_cookie_header = r.headers.get("set-cookie", "").lower()
    assert "samesite=strict" in set_cookie_header
    assert "httponly" not in set_cookie_header  # browser JS must read it


async def test_failed_login_does_not_set_csrf_cookie(
    seeded_for_mutation: asyncpg.Connection,
    http_client_no_csrf: httpx.AsyncClient,
) -> None:
    """A 401 login response must not mint a token. Otherwise an attacker
    could harvest valid CSRF tokens without ever authenticating."""
    email = await _po_email(seeded_for_mutation)

    r = await http_client_no_csrf.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong"},
    )
    assert r.status_code == 401
    assert r.cookies.get("csrf_token") is None
