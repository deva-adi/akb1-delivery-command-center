"""Per-IP sliding-bucket rate limit (PRD 03 section 11; slice 5b).

Tiered by path prefix per the 2c resolution:

  /api/v1/auth/*  -> rate_limit_auth_requests per window (10/min default)
  /api/v1/*       -> rate_limit_default_requests per window (120/min default)
  everything else -> exempt (health, /docs, static)

Algorithm is a per-minute bucket: key = ratelimit:{ip}:{window_start_minute},
INCR + EXPIRE on first hit. This is coarser than a true token bucket and
allows up to 2x burst at minute boundaries; documented in D-041 as an
accepted deviation from PRD section 11 at current scale.

IP resolution:

  trusted_proxy empty (dev default) -> request.client.host always wins;
                                       X-Forwarded-For is ignored so a
                                       caller cannot spoof their IP and
                                       evade their bucket.

  trusted_proxy non-empty (prod)    -> first IP in X-Forwarded-For is
                                       trusted as the real client IP.

Health endpoint is mounted at root (no /api/v1 prefix) so the prefix
filter naturally exempts it. Same for /docs, /openapi.json, /redoc.

The Redis client is read from request.app.state.redis_client. Production
sets it in the FastAPI lifespan; tests override via the http_client
fixture so fakeredis is used for isolation.
"""

from __future__ import annotations

import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import Settings


_DENIED_DETAIL = "Rate limit exceeded; slow down"


def _resolve_client_ip(request: Request, trusted_proxy: str) -> str:
    """Return the IP to bucket against. See module docstring for rules."""
    if trusted_proxy:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            first = forwarded.split(",", 1)[0].strip()
            if first:
                return first
    return request.client.host if request.client else "unknown"


def _resolve_limit(path: str, settings: Settings) -> int | None:
    """Return the per-window request limit for this path, or None if exempt.

    Exempt paths: anything not under /api/v1 (health, docs, root, etc).
    """
    if not path.startswith("/api/v1/"):
        return None
    if path.startswith("/api/v1/auth/"):
        return settings.rate_limit_auth_requests
    return settings.rate_limit_default_requests


class _SettingsView:
    """Minimal duck-typed Settings shim used by the middleware override path."""

    __slots__ = (
        "rate_limit_auth_requests",
        "rate_limit_default_requests",
        "rate_limit_window_seconds",
        "trusted_proxy",
    )

    def __init__(
        self,
        *,
        rate_limit_auth_requests: int,
        rate_limit_default_requests: int,
        rate_limit_window_seconds: int,
        trusted_proxy: str,
    ) -> None:
        self.rate_limit_auth_requests = rate_limit_auth_requests
        self.rate_limit_default_requests = rate_limit_default_requests
        self.rate_limit_window_seconds = rate_limit_window_seconds
        self.trusted_proxy = trusted_proxy


_OVERRIDE_ATTRS = (
    "rate_limit_auth_requests",
    "rate_limit_default_requests",
    "rate_limit_window_seconds",
    "trusted_proxy",
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """ASGI middleware enforcing per-IP request budgets.

    Each request reads its limits from request.app.state first (per-test
    overrides), falling back to the Settings instance passed at
    construction. The app.state seam lets tests inject low limits without
    rebuilding the middleware stack or restarting the app.
    """

    def __init__(self, app, settings: Settings) -> None:
        super().__init__(app)
        self._settings = settings

    def _effective_settings(self, request: Request):
        state = request.app.state
        if not any(hasattr(state, attr) for attr in _OVERRIDE_ATTRS):
            return self._settings
        base = self._settings
        return _SettingsView(
            rate_limit_auth_requests=getattr(
                state, "rate_limit_auth_requests", base.rate_limit_auth_requests
            ),
            rate_limit_default_requests=getattr(
                state,
                "rate_limit_default_requests",
                base.rate_limit_default_requests,
            ),
            rate_limit_window_seconds=getattr(
                state, "rate_limit_window_seconds", base.rate_limit_window_seconds
            ),
            trusted_proxy=getattr(state, "trusted_proxy", base.trusted_proxy),
        )

    async def dispatch(self, request: Request, call_next):
        settings = self._effective_settings(request)
        limit = _resolve_limit(request.url.path, settings)
        if limit is None:
            return await call_next(request)

        redis_client = getattr(request.app.state, "redis_client", None)
        if redis_client is None:
            # Wiring problem: Redis must be set on app.state by lifespan
            # (prod) or by the test fixture (tests). Fail loud.
            return JSONResponse(
                {"detail": "Rate limit backend unavailable"},
                status_code=503,
            )

        ip = _resolve_client_ip(request, settings.trusted_proxy)
        window = settings.rate_limit_window_seconds
        bucket = int(time.time()) // window
        key = f"ratelimit:{ip}:{bucket}"

        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.ttl(key)
        count, ttl = await pipe.execute()
        if ttl == -1:
            # First INCR of this bucket: stamp the TTL so it auto-evicts.
            # +1 second of slack so a request landing on the boundary still
            # has a non-zero TTL when read for Retry-After.
            await redis_client.expire(key, window + 1)
            ttl = window + 1

        if count > limit:
            retry_after = max(int(ttl), 1)
            return JSONResponse(
                {"detail": _DENIED_DETAIL},
                status_code=429,
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)
