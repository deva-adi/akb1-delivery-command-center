"""End-to-end audit-search flow.

Slice 4. Login as PO with AP=true via POST /auth/login, capture JWT,
then exercise PATCH endpoints from slice 1 plus 2 to seed real audit rows,
then query GET /audit/search and verify the rows are visible.
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
    """Lift the issued csrf_token cookie into the client's default
    X-CSRF-Token header after a real /auth/login response, so subsequent
    mutating calls satisfy the double-submit check."""
    issued = login_response.cookies.get("csrf_token")
    if issued:
        client.headers["X-CSRF-Token"] = issued


async def test_e2e_login_patch_then_search(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
        )
    )["email"]

    # Step 1: login
    login = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert login.json()["ap_flag"] is True
    _sync_csrf(http_client, login)

    # Step 2: PATCH tier 2 and PATCH a threshold to seed audit rows
    p1 = await http_client.patch(
        "/api/v1/admin/tier-config/2",
        json={"display_label": "AuditSearch Smoke 1"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert p1.status_code == 200

    p2 = await http_client.patch(
        "/api/v1/admin/threshold-register/portfolio_margin_pct",
        json={"green_threshold": "29.0"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert p2.status_code == 200

    # Step 3: GET /audit/search and verify those audit rows appear
    s = await http_client.get(
        "/api/v1/audit/search?resource_type=escalation_tier_config",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert s.status_code == 200, s.text
    body = s.json()
    assert body["total_count"] >= 1
    tier_row = body["items"][0]
    assert tier_row["resource_type"] == "escalation_tier_config"
    assert tier_row["http_method"] == "PATCH"
    assert tier_row["outcome"] == "Success"
    assert tier_row["actor_role"] == "PortfolioOwner"

    s2 = await http_client.get(
        "/api/v1/audit/search?resource_type=threshold_calibration_register",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert s2.status_code == 200
    assert s2.json()["total_count"] >= 1
    threshold_row = s2.json()["items"][0]
    assert threshold_row["resource_type"] == "threshold_calibration_register"


async def test_e2e_login_includes_login_audit_in_search(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """The login itself wrote an audit row (resource_type=auth_login)
    in slice 3; the search should surface it for AP-flagged callers."""
    po_email = (
        await seeded_for_mutation.fetchrow(
            "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
        )
    )["email"]

    login = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    _sync_csrf(http_client, login)

    s = await http_client.get(
        "/api/v1/audit/search?resource_type=auth_login&http_method=POST",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert s.status_code == 200
    items = s.json()["items"]
    assert any(
        i["resource_type"] == "auth_login" and i["outcome"] == "Success"
        for i in items
    )
