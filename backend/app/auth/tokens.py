"""JWT token helpers.

mint_token is also used by integration tests to build authenticated
requests against the FastAPI app. NextAuth integration lands at M7.
"""

from __future__ import annotations

import time
import uuid

import jwt as pyjwt

from app.config import get_settings


def mint_token(
    *,
    user_id: uuid.UUID | str,
    role: str,
    ap_flag: bool = False,
    expires_in_seconds: int = 3600,
) -> str:
    """Mint an HS256 JWT carrying user_id, role, and AP flag claims."""
    settings = get_settings()
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "role": role,
        "ap_flag": ap_flag,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    return pyjwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
