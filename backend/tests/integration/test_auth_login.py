"""POST /api/v1/auth/login integration tests.

Slice 3.2. Covers:
  1. Success: 200 with JWT plus user metadata; audit row Success.
  2. Wrong password (known email): 401 with uniform detail; audit row Denied.
  3. Unknown email: 401 with same detail (no existence leak); no audit row
     (deliberate trade-off documented in services/auth_login.py).
  4. Lockout: 5 failures within 15 min returns 429 with Retry-After.
  5. Lockout cleared on successful login.
  6. Body validation: missing email or password returns 422.
  7. Token shape: response carries access_token, token_type, expires_in,
     user_id, role, ap_flag. password_hash is never returned.
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest

from app.seed.generator import SEED_PASSWORD


pytestmark = pytest.mark.integration


# Lockout state is per-test isolated by the `fake_redis` fixture in
# conftest, which the `http_client` fixture pulls in transitively. No
# explicit reset hook needed since slice 5b moved lockout to Redis and
# the fake is flushed at fixture setup and teardown.


async def _po_email(conn: asyncpg.Connection) -> str:
    row = await conn.fetchrow(
        "SELECT email FROM people WHERE role = 'PortfolioOwner' LIMIT 1"
    )
    assert row is not None
    return row["email"]


# ---------------------------------------------------------------------------
# 1. Success
# ---------------------------------------------------------------------------

async def test_login_success_returns_200_and_jwt(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["token_type"] == "Bearer"
    assert body["role"] == "PortfolioOwner"
    assert body["ap_flag"] is True
    assert isinstance(body["access_token"], str)
    assert body["access_token"].count(".") == 2  # JWT has 3 parts
    assert body["expires_in"] > 0
    assert "password_hash" not in body
    assert "password" not in body


async def test_login_success_writes_audit_row(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before + 1

    row = await seeded_for_mutation.fetchrow(
        "SELECT actor_role, http_method, endpoint, resource_type, outcome "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert row["actor_role"] == "PortfolioOwner"
    assert row["http_method"] == "POST"
    assert row["endpoint"] == "/api/v1/auth/login"
    assert row["resource_type"] == "auth_login"
    assert row["outcome"] == "Success"


# ---------------------------------------------------------------------------
# 2. Wrong password (known email)
# ---------------------------------------------------------------------------

async def test_login_wrong_password_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "definitely_not_the_password"},
    )

    assert response.status_code == 401
    body = response.json()
    assert body["detail"] == "Invalid email or password"


async def test_login_wrong_password_writes_denied_audit(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong"},
    )
    assert response.status_code == 401

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before + 1

    row = await seeded_for_mutation.fetchrow(
        "SELECT actor_role, outcome, resource_type "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert row["outcome"] == "Denied"
    assert row["resource_type"] == "auth_login"
    assert row["actor_role"] == "PortfolioOwner"


# ---------------------------------------------------------------------------
# 3. Unknown email (no existence leak)
# ---------------------------------------------------------------------------

async def test_login_unknown_email_returns_401_with_same_detail(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@nowhere.test", "password": SEED_PASSWORD},
    )

    assert response.status_code == 401
    body = response.json()
    # Same detail as wrong-password case so existence is not inferable
    assert body["detail"] == "Invalid email or password"


async def test_login_unknown_email_writes_no_audit_row(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Documented trade-off: unknown-email failures do not audit because
    actor_user_id is NOT NULL FK. The 401 response is identical so no
    enumeration leak through the API."""
    n_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@nowhere.test", "password": "anything"},
    )
    assert response.status_code == 401

    n_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_after == n_before


# ---------------------------------------------------------------------------
# 4. Lockout
# ---------------------------------------------------------------------------

async def test_login_lockout_after_five_failures_returns_429(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    email = await _po_email(seeded_for_mutation)

    # 5 failed attempts; each returns 401
    for _ in range(5):
        r = await http_client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong"},
        )
        assert r.status_code == 401

    # 6th attempt is locked out
    r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong"},
    )
    assert r.status_code == 429
    assert "Retry-After" in r.headers
    assert int(r.headers["Retry-After"]) > 0
    assert r.json()["detail"] == "Too many failed attempts; try again later"


async def test_login_lockout_does_not_leak_to_other_emails(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Lockout is per-email. PM email failing 5 times must not lock the PO."""
    pm_row = await seeded_for_mutation.fetchrow(
        "SELECT email FROM people WHERE role = 'ProgrammeManager' LIMIT 1"
    )
    pm_email = pm_row["email"]
    po_email = await _po_email(seeded_for_mutation)

    for _ in range(5):
        await http_client.post(
            "/api/v1/auth/login",
            json={"email": pm_email, "password": "wrong"},
        )

    # PO should still be able to log in successfully
    r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": po_email, "password": SEED_PASSWORD},
    )
    assert r.status_code == 200


async def test_login_success_clears_lockout_history(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """4 failures then 1 success then 4 failures must NOT trigger lockout."""
    email = await _po_email(seeded_for_mutation)

    for _ in range(4):
        await http_client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong"},
        )

    r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert r.status_code == 200

    for _ in range(4):
        r = await http_client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong"},
        )
        assert r.status_code == 401  # not yet locked


# ---------------------------------------------------------------------------
# 6. Body validation
# ---------------------------------------------------------------------------

async def test_login_missing_email_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.post(
        "/api/v1/auth/login",
        json={"password": "x"},
    )
    assert response.status_code == 422


async def test_login_missing_password_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": "x@x.com"},
    )
    assert response.status_code == 422


async def test_login_unknown_field_returns_422(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": "x@x.com", "password": "x", "role": "PortfolioOwner"},
    )
    assert response.status_code == 422


async def test_login_response_omits_password_hash(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """The serialised response body must never carry password_hash."""
    email = await _po_email(seeded_for_mutation)

    response = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200
    body_text = response.text
    assert "password_hash" not in body_text
    assert "$2b$" not in body_text  # no bcrypt hash anywhere


# ---------------------------------------------------------------------------
# 8. Redis-backed lockout (slice 5b)
# ---------------------------------------------------------------------------

async def test_lockout_writes_redis_key_with_ttl(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """A failed login must create lockout:{email} in Redis with TTL <= 15 min."""
    email = await _po_email(seeded_for_mutation)

    r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong"},
    )
    assert r.status_code == 401

    key = f"lockout:{email}"
    value = await fake_redis.get(key)
    assert value == "1"

    ttl = await fake_redis.ttl(key)
    # TTL set on first failure to WINDOW_SECONDS (900). Floor at 1 to allow
    # for a hairsbreadth of clock travel between INCR and TTL.
    assert 1 <= ttl <= 900


async def test_lockout_clears_redis_key_on_success(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """Successful login must DEL the lockout key for that email."""
    email = await _po_email(seeded_for_mutation)

    # Two failures to seed the counter
    for _ in range(2):
        await http_client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong"},
        )

    key = f"lockout:{email}"
    assert await fake_redis.get(key) == "2"

    r = await http_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": SEED_PASSWORD},
    )
    assert r.status_code == 200
    assert await fake_redis.get(key) is None


async def test_lockout_keys_isolated_per_email_in_redis(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """Two emails failing must produce two distinct keys, no cross-contamination."""
    pm_row = await seeded_for_mutation.fetchrow(
        "SELECT email FROM people WHERE role = 'ProgrammeManager' LIMIT 1"
    )
    pm_email = pm_row["email"]
    po_email = await _po_email(seeded_for_mutation)

    await http_client.post(
        "/api/v1/auth/login", json={"email": pm_email, "password": "wrong"}
    )
    await http_client.post(
        "/api/v1/auth/login", json={"email": pm_email, "password": "wrong"}
    )
    await http_client.post(
        "/api/v1/auth/login", json={"email": po_email, "password": "wrong"}
    )

    assert await fake_redis.get(f"lockout:{pm_email}") == "2"
    assert await fake_redis.get(f"lockout:{po_email}") == "1"


def test_lockout_module_has_no_in_memory_state() -> None:
    """The slice 3 in-memory dict and threading lock must be gone.

    Regression guard: if anyone re-introduces a fallback state object the
    multi-worker correctness assumption silently breaks again.
    """
    from app.auth import lockout as lockout_module  # noqa: PLC0415

    public = {name for name in dir(lockout_module) if not name.startswith("_")}
    # The Redis-backed API surface
    assert "check_lockout" in public
    assert "record_failure" in public
    assert "clear" in public
    # The in-memory leftovers must be gone
    assert "reset_all" not in public
    assert not hasattr(lockout_module, "_FAILURES")
    assert not hasattr(lockout_module, "_LOCK")
