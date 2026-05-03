"""Integration test fixtures.

Three concerns covered:

  role_conn         parametrised across (akb1_app, akb1_owner). Used by the
                    audit append-only invariant tests in slice 2.3.

  owner_conn        single non-parametrised akb1_owner connection. Used for
                    setup that requires schema-owner privileges.

  owner_seeded      per-test akb1_owner connection over a session-scoped
                    seeded schema. Used by the slice 2.4 state-check tests.
                    The session fixture resets the schema via Alembic and
                    runs the seed once; per-test connections share the
                    seeded state.
"""

from __future__ import annotations

import asyncio

import asyncpg
import pytest
import pytest_asyncio

from tests.integration._helpers import APP_DSN, OWNER_DSN, reset_schema_via_alembic


_ROLE_CREDENTIALS = [
    ("akb1_app", APP_DSN),
    ("akb1_owner", OWNER_DSN),
]


@pytest_asyncio.fixture(params=_ROLE_CREDENTIALS, ids=["app", "owner"])
async def role_conn(request):
    """asyncpg connection parameterised across (akb1_app, akb1_owner).

    Tests that take this fixture run once per role.
    """
    _, dsn = request.param
    conn = await asyncpg.connect(dsn)
    try:
        yield conn
    finally:
        await conn.close()


@pytest_asyncio.fixture
async def owner_conn():
    """Connection as akb1_owner only."""
    conn = await asyncpg.connect(OWNER_DSN)
    try:
        yield conn
    finally:
        await conn.close()


@pytest.fixture(scope="session")
def session_seeded_schema():
    """Session-scoped: reset the schema once, then seed once.

    Used by tests that read the seeded state (row counts, programme names,
    threshold register completeness, etc). The seed itself is byte-locked
    so all sharing tests see identical content.

    Sync fixture because alembic.command is sync; uses asyncio.run for the
    async seed call. Per Option C resolution (D-037 candidate).
    """
    from app.seed.generator import seed  # noqa: PLC0415

    reset_schema_via_alembic()

    async def _do_seed():
        conn = await asyncpg.connect(OWNER_DSN)
        try:
            await seed(conn)
        finally:
            await conn.close()

    asyncio.run(_do_seed())


@pytest_asyncio.fixture
async def owner_seeded(session_seeded_schema):
    """Per-test akb1_owner connection over the session-scoped seeded schema."""
    conn = await asyncpg.connect(OWNER_DSN)
    try:
        yield conn
    finally:
        await conn.close()


@pytest_asyncio.fixture
async def seeded_for_mutation():
    """Per-test fresh seeded schema; for tests that mutate state.

    Resets via Alembic and re-seeds before yielding the akb1_owner
    connection. Slower than `owner_seeded` (~3s setup) but isolates
    mutation tests from each other and from the session-shared seed.
    """
    from app.seed.generator import seed  # noqa: PLC0415

    await asyncio.to_thread(reset_schema_via_alembic)
    conn = await asyncpg.connect(OWNER_DSN)
    try:
        await seed(conn)
        yield conn
    finally:
        await conn.close()


@pytest_asyncio.fixture
async def fake_redis():
    """Per-test fakeredis async client. Flushed at start and at teardown.

    Slice 5b: every test that touches Redis (lockout, rate limit) gets an
    isolated in-process fake. fakeredis.aioredis.FakeRedis is API-compatible
    with redis.asyncio.Redis for the commands we use (GET, INCR, EXPIRE,
    TTL, DELETE, pipeline).
    """
    import fakeredis.aioredis  # noqa: PLC0415

    client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    await client.flushall()
    try:
        yield client
    finally:
        await client.flushall()
        await client.aclose()


@pytest_asyncio.fixture
async def http_client(fake_redis):
    """httpx.AsyncClient bound to the FastAPI app via ASGITransport.

    raise_app_exceptions=False so unhandled exceptions in route handlers
    surface as 500 responses (matches production behaviour where Starlette
    catches and returns 500), not bubble up into the test code.

    Disposes the SQLAlchemy async engine before and after each test so its
    internal loop refs do not stale-bind across pytest's per-test event
    loops. NullPool already prevents connection caching, but the engine
    itself caches loop-bound machinery that the dispose call resets.

    Overrides app.cache.get_redis to yield the per-test fakeredis instance
    so every Redis-backed surface (lockout, rate limit) is isolated.

    Clears app.dependency_overrides at teardown so per-test injections do
    not leak across tests.
    """
    from httpx import ASGITransport, AsyncClient  # noqa: PLC0415

    from app import db as db_module  # noqa: PLC0415
    from app.cache import get_redis  # noqa: PLC0415
    from app.main import app  # noqa: PLC0415

    await db_module.engine.dispose()

    async def _override_get_redis():
        yield fake_redis

    app.dependency_overrides[get_redis] = _override_get_redis
    # Middleware reads from app.state directly (no Depends inside ASGI
    # middleware), so the same fakeredis instance is mirrored there.
    prior_state_client = getattr(app.state, "redis_client", None)
    app.state.redis_client = fake_redis

    # Cleanup any rate-limit override leftover from a prior test before
    # this one runs, so tests start from settings defaults.
    _RATE_LIMIT_OVERRIDE_ATTRS = (
        "rate_limit_auth_requests",
        "rate_limit_default_requests",
        "rate_limit_window_seconds",
        "trusted_proxy",
    )
    for attr in _RATE_LIMIT_OVERRIDE_ATTRS:
        if hasattr(app.state, attr):
            delattr(app.state, attr)

    # Pre-seed a CSRF cookie + matching default header so tests that
    # use mint_token() (i.e. bypass real /auth/login) still satisfy
    # the CSRF double-submit check. The dedicated test_csrf.py file
    # uses an alternate fixture without these defaults to exercise
    # the missing-header / mismatch / login-issuance paths directly.
    _CSRF_TEST_TOKEN = "test_csrf_token_fixed_value_for_default_client"

    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        cookies={"csrf_token": _CSRF_TEST_TOKEN},
        headers={"X-CSRF-Token": _CSRF_TEST_TOKEN},
    ) as client:
        try:
            yield client
        finally:
            app.dependency_overrides.clear()
            for attr in _RATE_LIMIT_OVERRIDE_ATTRS:
                if hasattr(app.state, attr):
                    delattr(app.state, attr)
            if prior_state_client is None:
                if hasattr(app.state, "redis_client"):
                    delattr(app.state, "redis_client")
            else:
                app.state.redis_client = prior_state_client
            await db_module.engine.dispose()


@pytest_asyncio.fixture
async def http_client_no_csrf(fake_redis):
    """Like http_client but without pre-seeded CSRF cookie or header.

    Used by test_csrf.py to exercise the missing-header, mismatch, and
    login-issuance paths without a default CSRF state masking the result.
    """
    from httpx import ASGITransport, AsyncClient  # noqa: PLC0415

    from app import db as db_module  # noqa: PLC0415
    from app.cache import get_redis  # noqa: PLC0415
    from app.main import app  # noqa: PLC0415

    await db_module.engine.dispose()

    async def _override_get_redis():
        yield fake_redis

    app.dependency_overrides[get_redis] = _override_get_redis
    prior_state_client = getattr(app.state, "redis_client", None)
    app.state.redis_client = fake_redis

    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        try:
            yield client
        finally:
            app.dependency_overrides.clear()
            if prior_state_client is None:
                if hasattr(app.state, "redis_client"):
                    delattr(app.state, "redis_client")
            else:
                app.state.redis_client = prior_state_client
            await db_module.engine.dispose()
