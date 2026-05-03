"""Per-IP rate limit middleware tests (slice 5b, item 2).

Covers:
  1. Health endpoint exempt (no /api/v1 prefix).
  2. /api/v1/auth/* enforces the strict auth limit.
  3. /api/v1/* (non-auth) enforces the default limit.
  4. 429 response includes a positive Retry-After header.
  5. Counter resets when the bucket key expires.
  6. With trusted_proxy empty (default), X-Forwarded-For cannot spoof IP
     to escape the bucket.
  7. With trusted_proxy set, X-Forwarded-For first-IP becomes the bucket
     key so two distinct upstream IPs get distinct buckets.

Limits are dropped to small values via app.state overrides so the tests
are fast and deterministic (no need to fire 121 requests).
"""

from __future__ import annotations

import asyncpg
import httpx
import pytest


pytestmark = pytest.mark.integration


def _set_low_limits(
    http_client_app,
    *,
    auth_requests: int = 3,
    default_requests: int = 5,
    window_seconds: int = 60,
    trusted_proxy: str = "",
) -> None:
    http_client_app.state.rate_limit_auth_requests = auth_requests
    http_client_app.state.rate_limit_default_requests = default_requests
    http_client_app.state.rate_limit_window_seconds = window_seconds
    http_client_app.state.trusted_proxy = trusted_proxy


# ---------------------------------------------------------------------------
# 1. Health exemption
# ---------------------------------------------------------------------------

async def test_rate_limit_does_not_apply_to_health(
    http_client: httpx.AsyncClient,
) -> None:
    from app.main import app

    _set_low_limits(app, default_requests=2)

    # Way past the default limit; all should pass because /health is not
    # under /api/v1.
    for _ in range(20):
        r = await http_client.get("/health")
        assert r.status_code == 200, r.text


# ---------------------------------------------------------------------------
# 2. Auth tier
# ---------------------------------------------------------------------------

async def test_rate_limit_blocks_auth_after_auth_limit(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    from app.main import app

    _set_low_limits(app, auth_requests=3)

    # 3 allowed (any combination of valid or invalid; we send invalid
    # bodies because they short-circuit at 422 without DB or audit cost).
    for _ in range(3):
        r = await http_client.post("/api/v1/auth/login", json={})
        assert r.status_code == 422

    # 4th hits the rate limit
    r = await http_client.post("/api/v1/auth/login", json={})
    assert r.status_code == 429
    assert r.json()["detail"] == "Rate limit exceeded; slow down"
    assert "Retry-After" in r.headers
    assert int(r.headers["Retry-After"]) >= 1


# ---------------------------------------------------------------------------
# 3. Default tier
# ---------------------------------------------------------------------------

async def test_rate_limit_blocks_non_auth_after_default_limit(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    from app.main import app

    _set_low_limits(app, default_requests=4)

    # GET /audit/search is under /api/v1/ but not /auth/. Without a JWT
    # the rate limit fires before the auth dependency does, but only if
    # the limit is reached. We send 4 unauthenticated requests (each 401)
    # then expect the 5th to be 429.
    for _ in range(4):
        r = await http_client.get("/api/v1/audit/search")
        assert r.status_code in (401, 403, 422), r.text

    r = await http_client.get("/api/v1/audit/search")
    assert r.status_code == 429
    assert "Retry-After" in r.headers


# ---------------------------------------------------------------------------
# 4. Auth and default tiers are independent buckets
# ---------------------------------------------------------------------------

async def test_rate_limit_shared_counter_with_tiered_caps(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Bucket counter is shared per IP per minute; each tier compares the
    shared counter against its own cap.

    Consequence: saturating the strict auth tier (counter > auth_limit)
    rejects further auth calls but does not block default-tier calls
    until the counter also exceeds default_limit. This is the documented
    behaviour for slice 5b given the single-bucket key shape Adi locked
    in the kickoff. Per-tier buckets are deferred.
    """
    from app.main import app

    _set_low_limits(app, auth_requests=2, default_requests=6)

    # 2 auth requests pass (counter 1, 2)
    for _ in range(2):
        r = await http_client.post("/api/v1/auth/login", json={})
        assert r.status_code == 422

    # 3rd auth request: counter=3, > auth_limit=2, 429
    r = await http_client.post("/api/v1/auth/login", json={})
    assert r.status_code == 429

    # Default tier still has budget. Counter goes 4, 5, 6 across these
    # GETs; each is below default_limit=6.
    for _ in range(3):
        r = await http_client.get("/api/v1/audit/search")
        assert r.status_code in (401, 403, 422), r.text

    # Counter is now 6. The 7th request (any tier) trips default_limit.
    r = await http_client.get("/api/v1/audit/search")
    assert r.status_code == 429


# ---------------------------------------------------------------------------
# 5. Counter resets when bucket expires
# ---------------------------------------------------------------------------

async def test_rate_limit_counter_resets_when_bucket_expires(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """Simulate window expiry by manually deleting the bucket key."""
    from app.main import app

    _set_low_limits(app, auth_requests=2)

    # Saturate
    for _ in range(2):
        await http_client.post("/api/v1/auth/login", json={})
    r = await http_client.post("/api/v1/auth/login", json={})
    assert r.status_code == 429

    # Drop all rate-limit keys (simulates the per-minute bucket aging out)
    keys = [k async for k in fake_redis.scan_iter(match="ratelimit:*")]
    if keys:
        await fake_redis.delete(*keys)

    # Now requests succeed again
    r = await http_client.post("/api/v1/auth/login", json={})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# 6. Trusted-proxy=empty: X-Forwarded-For is ignored (anti-spoof)
# ---------------------------------------------------------------------------

async def test_rate_limit_ignores_xff_when_trusted_proxy_unset(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """A caller cannot escape the per-IP bucket by faking X-Forwarded-For.

    With trusted_proxy empty (dev default) the middleware uses
    request.client.host only.
    """
    from app.main import app

    _set_low_limits(app, auth_requests=2, trusted_proxy="")

    headers_a = {"X-Forwarded-For": "10.0.0.1"}
    headers_b = {"X-Forwarded-For": "10.0.0.2"}

    # Two requests with different XFF headers from the same real client
    await http_client.post("/api/v1/auth/login", json={}, headers=headers_a)
    await http_client.post("/api/v1/auth/login", json={}, headers=headers_b)

    # Third request would have been allowed if XFF were trusted (3 distinct
    # "IPs"), but is denied because the real client.host is shared.
    r = await http_client.post("/api/v1/auth/login", json={}, headers=headers_a)
    assert r.status_code == 429


# ---------------------------------------------------------------------------
# 7. Trusted-proxy set: X-Forwarded-For first IP is the bucket key
# ---------------------------------------------------------------------------

async def test_rate_limit_honours_xff_when_trusted_proxy_set(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """When trusted_proxy is set, two distinct XFF first-IPs map to two
    distinct buckets; saturating one does not block the other."""
    from app.main import app

    _set_low_limits(app, auth_requests=2, trusted_proxy="proxy-marker")

    headers_a = {"X-Forwarded-For": "10.0.0.1"}
    headers_b = {"X-Forwarded-For": "10.0.0.2, proxy-marker"}

    # Saturate IP A
    for _ in range(2):
        await http_client.post("/api/v1/auth/login", json={}, headers=headers_a)
    r = await http_client.post("/api/v1/auth/login", json={}, headers=headers_a)
    assert r.status_code == 429

    # IP B still has budget
    r = await http_client.post("/api/v1/auth/login", json={}, headers=headers_b)
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# 8. Bucket key shape regression guard
# ---------------------------------------------------------------------------

async def test_rate_limit_writes_expected_bucket_key_in_redis(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    fake_redis,
) -> None:
    """The Redis key shape is contract: ratelimit:{ip}:{minute_bucket}."""
    from app.main import app

    _set_low_limits(app, auth_requests=10)

    await http_client.post("/api/v1/auth/login", json={})

    keys = [k async for k in fake_redis.scan_iter(match="ratelimit:*")]
    assert len(keys) == 1
    parts = keys[0].split(":")
    assert parts[0] == "ratelimit"
    assert len(parts) == 3
    # Bucket suffix is an int (epoch minute).
    assert parts[2].isdigit()

    # TTL stamped to window+1
    ttl = await fake_redis.ttl(keys[0])
    assert 1 <= ttl <= 61
