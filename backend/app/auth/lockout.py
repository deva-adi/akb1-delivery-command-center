"""Per-email login lockout, Redis-backed (slice 5b).

5 failed login attempts per email within a 15-minute window triggers a
429 with Retry-After. The slice 3 in-memory dict has been removed; Redis
is now the only state store. If Redis is unreachable login fails loudly,
which is intentional: an in-memory fallback would silently regress the
brute-force defense across multiple workers.

Counter semantics. INCR on each failure; EXPIRE set on the first failure
of a window. The key (lockout:{email}) carries TTL = WINDOW_SECONDS from
the moment of first failure. Subsequent failures within the window
increment the counter but do not refresh the TTL; the window is anchored
to the FIRST failure, not the latest. Once the counter reaches
MAX_ATTEMPTS, check_lockout returns the remaining TTL as Retry-After.

Per-IP rate limiting (PRD 03 section 11) is a separate defense and lives
in app/middleware/rate_limit.py.
"""

from __future__ import annotations

from typing import Final

import redis.asyncio as aioredis


WINDOW_SECONDS: Final[int] = 15 * 60
MAX_ATTEMPTS: Final[int] = 5
KEY_PREFIX: Final[str] = "lockout:"


def _key(email: str) -> str:
    return f"{KEY_PREFIX}{email}"


async def check_lockout(redis_client: aioredis.Redis, email: str) -> int | None:
    """Return seconds-until-retry if the email is locked, otherwise None."""
    key = _key(email)
    raw = await redis_client.get(key)
    if raw is None:
        return None
    try:
        attempts = int(raw)
    except (TypeError, ValueError):
        return None
    if attempts < MAX_ATTEMPTS:
        return None
    ttl = await redis_client.ttl(key)
    # ttl == -1: key has no expiry (lost the EXPIRE race; treat as full window)
    # ttl == -2: key just expired between GET and TTL; treat as not locked
    if ttl == -2:
        return None
    if ttl < 0:
        return WINDOW_SECONDS
    return max(int(ttl), 1)


async def record_failure(redis_client: aioredis.Redis, email: str) -> None:
    """Increment the failure counter; set TTL on the first failure of the window.

    Pipelined INCR + TTL so the EXPIRE-on-first decision is made from a
    single round trip. If TTL comes back -1 (no expiry set), apply
    WINDOW_SECONDS. This catches both the first-failure path (-1 expected
    after fresh INCR before EXPIRE) and the rare race where two parallel
    failures both saw a virgin key.
    """
    key = _key(email)
    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.ttl(key)
    _new_value, ttl = await pipe.execute()
    if ttl == -1:
        await redis_client.expire(key, WINDOW_SECONDS)


async def clear(redis_client: aioredis.Redis, email: str) -> None:
    """Drop the lockout state on successful login."""
    await redis_client.delete(_key(email))
