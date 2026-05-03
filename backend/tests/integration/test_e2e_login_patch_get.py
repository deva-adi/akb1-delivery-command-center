"""End-to-end auth flow: login -> PATCH -> GET in sequence.

Slice 3.4. Validates the production auth path: token issued by
POST /auth/login is accepted by PATCH /admin/tier-config/{n} and GET
/admin/tier-config. Replaces direct mint_token with the actual login flow
so a regression in the login -> PATCH/GET handoff would surface here.
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest

from app.seed.generator import SEED_PASSWORD


pytestmark = pytest.mark.integration


# Per-test lockout isolation comes from the `fake_redis` fixture pulled in
# transitively by `http_client` (slice 5b). No explicit reset hook needed.


def _sync_csrf(client: httpx.AsyncClient, login_response: httpx.Response) -> None:
    """After a real /auth/login, lift the issued csrf_token cookie into the
    client's default X-CSRF-Token header so subsequent mutating calls pass
    the double-submit check. The pre-seeded fixture default no longer
    matches the freshly-issued cookie."""
    issued = login_response.cookies.get("csrf_token")
    if issued:
        client.headers["X-CSRF-Token"] = issued


async def test_e2e_login_then_patch_then_get(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Full happy path: login PO, PATCH tier 2, GET list, see new label."""
    po_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
        )
    )["email"]

    # Step 1: login
    login_resp = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json()["access_token"]
    assert login_resp.json()["role"] == "PortfolioOwner"
    _sync_csrf(http_client, login_resp)

    # Step 2: PATCH tier 2 with the real token
    patch_resp = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "End to End Director"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_resp.status_code == 200, patch_resp.text
    assert patch_resp.json()["display_label"] == "End to End Director"

    # Step 3: GET the list, find tier 2, verify new label
    get_resp = await http_client.get(
        "/api/v1/admin/tier-config",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200, get_resp.text
    items = get_resp.json()["items"]
    tier_2 = next(i for i in items if i["tier_number"] == 2)
    assert tier_2["display_label"] == "End to End Director"
    assert tier_2["default_label"] == "Programme Director"  # immutable


async def test_e2e_login_returns_token_usable_against_threshold_endpoints(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """The same JWT issued by /auth/login works against threshold-register."""
    po_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
        )
    )["email"]

    login_resp = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    _sync_csrf(http_client, login_resp)

    # PATCH a threshold
    patch_resp = await http_client.patch(
        "/api/v1/admin/threshold-register/portfolio_margin_pct",
        json={"green_threshold": "31.0"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_resp.status_code == 200

    # GET the list, verify the change is visible
    get_resp = await http_client.get(
        "/api/v1/admin/threshold-register",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    margin = next(
        r for r in get_resp.json()["items"]
        if r["metric_id"] == "portfolio_margin_pct"
    )
    assert margin["green_threshold"] == "31.00"  # NUMERIC(10,2) DB rounding


async def test_e2e_login_fails_for_pm_then_succeeds_for_po(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """A PM's token is rejected on PATCH; a fresh PO login token works."""
    pm_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'ProgrammeManager' LIMIT 1"
        )
    )["email"]
    po_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
        )
    )["email"]

    pm_login = await http_client.post(
        "/api/v1/auth/login",
        json={"email": pm_email, "password": SEED_PASSWORD},
    )
    assert pm_login.status_code == 200
    pm_token = pm_login.json()["access_token"]
    _sync_csrf(http_client, pm_login)

    # PM is forbidden from PATCH
    pm_patch = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "PM Should Not Set This"},
        headers={"Authorization": f"Bearer {pm_token}"},
    )
    assert pm_patch.status_code == 403

    # PO login and PATCH succeeds
    po_login = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert po_login.status_code == 200
    po_token = po_login.json()["access_token"]
    _sync_csrf(http_client, po_login)

    po_patch = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "PO Set This"},
        headers={"Authorization": f"Bearer {po_token}"},
    )
    assert po_patch.status_code == 200
