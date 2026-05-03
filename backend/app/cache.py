"""Redis client factory and FastAPI dependency.

Single async Redis client shared across the process. The client is
connection-pooled internally so a module-level singleton is correct;
per-request creation would defeat pooling.

Slice 5b uses Redis for two surfaces: per-email login lockout
(app/auth/lockout.py) and per-IP rate limiting (app/middleware/rate_limit.py).
Both connect via get_redis_client(). Tests inject fakeredis by overriding
the get_redis FastAPI dependency in conftest.

No graceful in-memory fallback. If REDIS_URL is unreachable the request
fails loudly so ops sees the gap. Slice 3 in-memory lockout removed.
"""

from __future__ import annotations

from typing import AsyncIterator

import redis.asyncio as aioredis

from app.config import get_settings


_client: aioredis.Redis | None = None


def get_redis_client() -> aioredis.Redis:
    """Return the process-wide async Redis client, creating it on first call.

    decode_responses=True so all reads come back as str, not bytes; this
    matches the lockout and rate-limit code paths that compare to int.
    """
    global _client
    if _client is None:
        settings = get_settings()
        _client = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
    return _client


async def close_redis_client() -> None:
    """Shutdown hook. Close the singleton if it was created."""
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


async def get_redis() -> AsyncIterator[aioredis.Redis]:
    """FastAPI dependency. Yields the shared client.

    Tests override via app.dependency_overrides[get_redis] to inject fakeredis.
    """
    yield get_redis_client()
