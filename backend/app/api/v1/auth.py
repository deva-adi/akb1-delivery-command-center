"""Auth endpoints. Slice 3.2: POST /api/v1/auth/login."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

import redis.asyncio as aioredis

from app.api.v1.admin import get_audit_writer
from app.cache import get_redis
from app.db import get_session
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.audited_mutation import AuditWriter
from app.services.auth_login import login


router = APIRouter()


@router.post(
    "/auth/login",
    response_model=LoginResponse,
    status_code=200,
)
async def post_login(
    body: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    audit_writer: AuditWriter = Depends(get_audit_writer),
    redis_client: aioredis.Redis = Depends(get_redis),
) -> LoginResponse:
    """Authenticate by email + password. Issue HS256 JWT.

    Uniform 401 on unknown user or wrong password (no existence leak).
    429 with Retry-After if 5 failed attempts in 15 minutes for this email.
    Audit row written on Success and on known-email Denied.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    token, user, expires_in = await login(
        session,
        redis_client,
        email=body.email,
        password=body.password,
        ip_address=ip_address,
        user_agent=user_agent,
        endpoint_path=request.url.path,
        audit_writer=audit_writer,
    )

    return LoginResponse(
        access_token=token,
        token_type="Bearer",
        expires_in=expires_in,
        user_id=user.person_id,
        role=user.role,
        ap_flag=user.ap_flag,
    )
