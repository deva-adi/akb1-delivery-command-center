"""Login service.

Single source of truth for the credential check. Uniform 401 response on
unknown user OR wrong password (no existence leak). Audit row written for
every Success and for Denied where the user is known.

Unknown-email denials are NOT audited because audit_trail_entries.actor
_user_id is NOT NULL FK and we have no actor to attribute the failed
attempt to. AP observers derive unknown-email patterns from external
logs (operator-side). A sentinel "system" user could be seeded so
unknown-email failures attribute to it; that is deferred per Adi
confirmation in the slice 3 close until an explicit AP-observer
requirement surfaces.

Per PRD 03 section 5.1 the token is HS256 with JWT_SECRET; Phase 2
introduces refresh-token cookie rotation. Slice 3 ships access token only.

Lockout: 5 failed attempts per email in 15 minutes returns 429 with
Retry-After. Backed by Redis since slice 5b (was in-memory single-worker
in slice 3). Per-IP rate limiting (PRD 03 section 11) is a separate
defense in app/middleware/rate_limit.py.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import redis.asyncio as aioredis

from app.auth import lockout
from app.auth.passwords import verify_password
from app.auth.tokens import mint_token
from app.config import get_settings
from app.models import Person
from app.services.audit import write_audit_entry
from app.services.audited_mutation import AuditWriter


_INVALID_DETAIL = "Invalid email or password"
_LOCKED_DETAIL = "Too many failed attempts; try again later"
_RESOURCE_TYPE = "auth_login"
_ENDPOINT = "/api/v1/auth/login"


async def login(
    session: AsyncSession,
    redis_client: aioredis.Redis,
    *,
    email: str,
    password: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
    endpoint_path: str = _ENDPOINT,
    audit_writer: AuditWriter = write_audit_entry,
) -> tuple[str, Person, int]:
    """Authenticate, audit, return (token, user, expires_in_seconds).

    Raises HTTPException with uniform 401 detail on bad credentials so a
    caller cannot distinguish unknown-email from wrong-password. Raises
    429 with Retry-After if the email is locked out.
    """

    retry_after = await lockout.check_lockout(redis_client, email)
    if retry_after is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=_LOCKED_DETAIL,
            headers={"Retry-After": str(retry_after)},
        )

    stmt = select(Person).where(Person.email == email)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.password_hash):
        # Known-email failures audit; unknown-email failures do not because
        # actor_user_id is NOT NULL FK. Both paths return identical 401 so
        # the API does not leak which case applied.
        if user is not None:
            await audit_writer(
                session,
                actor_user_id=user.person_id,
                actor_role=user.role,
                endpoint=endpoint_path,
                http_method="POST",
                resource_type=_RESOURCE_TYPE,
                resource_id=user.person_id,
                before_json=None,
                after_json={"email": email, "result": "denied"},
                outcome="Denied",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            await session.commit()
        await lockout.record_failure(redis_client, email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=_INVALID_DETAIL,
        )

    # Success path
    await audit_writer(
        session,
        actor_user_id=user.person_id,
        actor_role=user.role,
        endpoint=endpoint_path,
        http_method="POST",
        resource_type=_RESOURCE_TYPE,
        resource_id=user.person_id,
        before_json=None,
        after_json={"email": email, "result": "success"},
        outcome="Success",
        ip_address=ip_address,
        user_agent=user_agent,
    )
    await session.commit()
    await lockout.clear(redis_client, email)

    settings = get_settings()
    expires_in = settings.jwt_expiry_minutes * 60
    token = mint_token(
        user_id=user.person_id,
        role=user.role,
        ap_flag=user.ap_flag,
        expires_in_seconds=expires_in,
    )
    return token, user, expires_in
