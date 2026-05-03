"""FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.admin import router as admin_router
from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.cache import close_redis_client, get_redis_client
from app.config import get_settings
from app.middleware.csrf import CsrfMiddleware
from app.middleware.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Single shared Redis client lives on app.state so middleware (which
    # cannot use Depends) can read it the same way as DI-driven routes.
    app.state.redis_client = get_redis_client()
    try:
        yield
    finally:
        await close_redis_client()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Middleware add order is reversed at request time (last added wraps
    # outermost). Rate limit must be outermost so it sheds load before any
    # other work happens; CSRF runs inside it.
    app.add_middleware(CsrfMiddleware, settings=settings)
    app.add_middleware(RateLimitMiddleware, settings=settings)

    # Health endpoint mounted at root (not under /api/v1) so container probes
    # do not depend on the api prefix changing, and so it is exempt from
    # rate limiting by virtue of the prefix filter.
    app.include_router(health_router, tags=["health"])

    # API v1 routers
    app.include_router(auth_router, prefix=settings.api_prefix, tags=["auth"])
    app.include_router(admin_router, prefix=settings.api_prefix, tags=["admin"])
    app.include_router(audit_router, prefix=settings.api_prefix, tags=["audit"])

    return app


app = create_app()
