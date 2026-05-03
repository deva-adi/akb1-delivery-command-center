"""Runtime configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "AKB1 Delivery Command Center"
    app_version: str = "0.3.0-backend"
    api_prefix: str = "/api/v1"

    # Database. Two roles per D-036: akb1_owner performs DDL plus grants
    # via Alembic; akb1_app is the FastAPI runtime role with SELECT plus
    # INSERT on audit_trail_entries (UPDATE and DELETE REVOKE'd).
    database_url: str = Field(
        default="postgresql+asyncpg://akb1_app:akb1_app_password@localhost:5432/akb1_dcc",
        description="Async DSN used by the FastAPI app role",
    )
    database_url_migrations: str = Field(
        default="postgresql+asyncpg://akb1_owner:akb1_owner_password@localhost:5432/akb1_dcc",
        description="Async DSN used by Alembic migrations as akb1_owner",
    )
    database_echo: bool = False
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Redis (lockout and rate-limit backing store; slice 5b)
    redis_url: str = "redis://localhost:6379/0"

    # Per-IP rate limit (PRD 03 section 11; slice 5b 2c resolution).
    # Tiered by surface: /auth/* gets the strict limit, all other /api/v1/*
    # gets the default. Intelligence-tier limit is deferred until that
    # prefix exists. Token-bucket from PRD swapped for per-minute sliding
    # bucket; documented in D-041 as accepted deviation at current scale.
    rate_limit_auth_requests: int = 10
    rate_limit_default_requests: int = 120
    rate_limit_window_seconds: int = 60

    # Empty in dev: X-Forwarded-For is ignored and request.client.host is
    # the source of truth. Set in production compose when behind a trusted
    # reverse proxy: the first IP in X-Forwarded-For is then trusted as
    # the client IP. Closes the dev-time header-spoof bypass.
    trusted_proxy: str = ""

    # CSRF (slice 5b). Cookie name is fixed by PRD 03 section 9.
    csrf_cookie_name: str = "csrf_token"
    csrf_header_name: str = "X-CSRF-Token"
    csrf_token_bytes: int = 32

    # Auth (JWT only in M6 backend; NextAuth lands at M7)
    jwt_secret: str = Field(
        default="replace_with_long_random_string_before_deploy",
        description="HS256 secret. Override via env JWT_SECRET",
    )
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60

    # Determinism anchor
    seed: int = 20260424

    # Observability
    log_level: str = "INFO"
    log_format: str = "json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
