"""FastAPI auth dependencies.

  get_current_user        parses the Bearer JWT and returns a CurrentUser.
  require_role(...)       factory that enforces a role allowlist; raises
                          403 on mismatch, 401 on missing token. No audit.
  require_ap_flag()       enforces user.ap_flag is true; raises 403
                          "Audit Permission required" on false. No audit.
  require_audit_access()  composite for AP-gated endpoints (PRD 26 audit
                          console, PRD 25 AI governance audit-scope). On
                          role mismatch writes RoleDenied audit row + 403.
                          On ap_flag false writes ApFlagDenied audit row
                          + 403. Both denials are queryable by AP observers.
  require_programme_access()  async helper called from scoped endpoints.
                          Raises 403 when DD/FL/PM does not have an entry
                          in person_programme_assignments for the requested
                          programme_code. PO/HRBP/RO skip this check entirely.
                          Not a FastAPI dependency factory; called imperatively
                          inside the endpoint after the role gate passes.
"""

from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt as pyjwt
from jwt.exceptions import InvalidTokenError as JWTError
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_session


class CurrentUser(BaseModel):
    user_id: uuid.UUID
    role: str
    ap_flag: bool = False


_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    try:
        payload = pyjwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    try:
        return CurrentUser(
            user_id=uuid.UUID(payload["sub"]),
            role=payload["role"],
            ap_flag=bool(payload.get("ap_flag", False)),
        )
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token payload missing required claim: {exc}",
        ) from exc


def require_role(*allowed_roles: str):
    """Return a dependency that enforces the caller's role is in the list.

    Pure auth check; no DB writes. For AP-gated endpoints that need audit
    rows on denial, use require_audit_access instead.
    """
    allowed = frozenset(allowed_roles)

    async def _enforce(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role {user.role!r} is not authorised for this endpoint; "
                    f"requires one of {sorted(allowed)}"
                ),
            )
        return user

    return _enforce


def require_ap_flag():
    """Standalone dependency that enforces user.ap_flag is true.

    Pure auth check; no DB writes. Compose with require_role at endpoint
    level if you want both checks without audit-on-denial. For audit
    console endpoints that must write RoleDenied / ApFlagDenied audit
    rows, use require_audit_access instead.
    """

    async def _enforce(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not user.ap_flag:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Audit Permission required",
            )
        return user

    return _enforce


def require_audit_access(
    resource_type: str,
    *allowed_roles: str,
    strict_ap: bool = False,
):
    """Composite dependency for AP-gated endpoints.

    Distinct denial outcomes per D-038 decision 10:
      - role not in allowed_roles -> writes RoleDenied audit row + 403
      - ap_flag is false          -> writes ApFlagDenied audit row + 403

    Default mode (strict_ap=False, slice 4 /audit/search): PortfolioOwner is
    allowed through with ap_flag false; the endpoint applies a row-scope
    filter (own actions only) instead of 403. DD and FL require ap_flag
    true. This matches the slice 4 kickoff scope (PRD 26 access matrix is
    more permissive for DD/FL without AP and lands in a later slice).

    Strict mode (strict_ap=True, slice 5c /audit/entry/{id}): the PO
    carve-out is removed. Every allowed role must have ap_flag true,
    including PortfolioOwner. Used on endpoints that return mutation
    deltas (before / after JSON) where there is no metadata-only fallback
    a non-AP caller could be safely scoped to.

    Audit row is written via the standard write_audit_entry helper inside
    the request session; explicit commit ensures the row persists before
    the HTTPException propagates and FastAPI returns 403. Pattern mirrors
    services/auth_login.py from slice 3.
    """
    allowed = frozenset(allowed_roles)
    PO_ALLOWED_WITHOUT_AP = "PortfolioOwner"

    async def _enforce(
        request: Request,
        user: CurrentUser = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ) -> CurrentUser:
        # Lazy import so module import doesn't pull the audit service
        from app.services.audit import write_audit_entry  # noqa: PLC0415

        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        if user.role not in allowed:
            # Best-effort audit write. An IntegrityError (e.g. actor_user_id FK
            # not in people) must never swallow the 403 -- roll back and proceed.
            try:
                await write_audit_entry(
                    session,
                    actor_user_id=user.user_id,
                    actor_role=user.role,
                    endpoint=request.url.path,
                    http_method=request.method,
                    resource_type=resource_type,
                    resource_id=None,
                    before_json=None,
                    after_json={"reason": "role_not_allowed", "allowed": sorted(allowed)},
                    outcome="RoleDenied",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                await session.commit()
            except Exception:
                await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role {user.role!r} is not authorised for this endpoint; "
                    f"requires one of {sorted(allowed)}"
                ),
            )

        # AP requirement.
        # Default mode: every allowed role except PortfolioOwner needs ap_flag.
        # Strict mode: every allowed role needs ap_flag, including PortfolioOwner.
        po_carve_out = (not strict_ap) and user.role == PO_ALLOWED_WITHOUT_AP
        if not po_carve_out and not user.ap_flag:
            try:
                await write_audit_entry(
                    session,
                    actor_user_id=user.user_id,
                    actor_role=user.role,
                    endpoint=request.url.path,
                    http_method=request.method,
                    resource_type=resource_type,
                    resource_id=None,
                    before_json=None,
                    after_json={"reason": "ap_flag_required"},
                    outcome="ApFlagDenied",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                await session.commit()
            except Exception:
                await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Audit Permission required",
            )

        return user

    return _enforce


async def require_programme_access(
    programme_code: str,
    user: CurrentUser,
    session: AsyncSession,
) -> None:
    """Assert that a scoped user (DD/FL/PM) has access to this programme.

    Checks person_programme_assignments for an entry (user.user_id, programme_code).
    Raises 403 if no matching assignment is found. PO/HRBP/RO callers bypass
    this entirely at the endpoint level.

    Not a FastAPI dependency factory. Called imperatively inside endpoints that
    already have a session from Depends(get_session) and a user from require_role.
    """
    from app.models.person_programme_assignment import PersonProgrammeAssignment  # noqa: PLC0415

    assignment = await session.scalar(
        select(PersonProgrammeAssignment.programme_id).where(
            PersonProgrammeAssignment.person_id == user.user_id,
            PersonProgrammeAssignment.programme_id == programme_code,
        )
    )
    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Role {user.role!r} does not have access to programme {programme_code!r}"
            ),
        )
