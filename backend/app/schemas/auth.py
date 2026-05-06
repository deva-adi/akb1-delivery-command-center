"""Auth request and response schemas (slice 3.2: POST /auth/login)."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Body for POST /api/v1/auth/login. extra='forbid' rejects unknown keys
    so a forwarded `password_hash` or `role` never leaks through the boundary."""

    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=128)
    password: str = Field(min_length=1, max_length=200)


class LoginResponse(BaseModel):
    """Issued JWT plus minimal user metadata. password_hash is never returned;
    no log line emits the request password or the issued token."""

    access_token: str
    token_type: str = "Bearer"
    expires_in: int
    user_id: uuid.UUID
    role: str
    ap_flag: bool
