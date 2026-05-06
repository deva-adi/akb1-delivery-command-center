"""Async SQLAlchemy engine, session factory, and declarative base."""

import os
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import get_settings


class Base(DeclarativeBase):
    """Single declarative base for all ORM models in this service."""


_settings = get_settings()

# Under pytest, every test runs in its own event loop. A module-level
# engine with a connection pool would bind connections to the loop that
# imported it, then break when later tests pull a "stale" connection on a
# different loop. NullPool gives each request a fresh connection, which
# binds to the current loop. The cost is a connect-per-request overhead
# that does not matter in tests.
_in_pytest = bool(os.getenv("PYTEST_CURRENT_TEST"))

if _in_pytest:
    engine = create_async_engine(
        _settings.database_url,
        echo=_settings.database_echo,
        poolclass=NullPool,
    )
else:
    engine = create_async_engine(
        _settings.database_url,
        echo=_settings.database_echo,
        pool_size=_settings.database_pool_size,
        max_overflow=_settings.database_max_overflow,
        pool_pre_ping=True,
    )

SessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
    class_=AsyncSession,
)


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency that yields a request-scoped session."""
    async with SessionLocal() as session:
        yield session
