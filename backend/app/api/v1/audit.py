"""Audit Trail Console endpoints.

Slice 4: GET /api/v1/audit/search.
Slice 5c: GET /api/v1/audit/entry/{entry_id}.

Per PRD 26 section 10. AP-gated via require_audit_access; the dependency
writes RoleDenied / ApFlagDenied audit rows on 403 so denials are
queryable by AP observers.

The two endpoints differ in AP strictness:
  - /audit/search: PortfolioOwner with AP=false is allowed through with
    own-actions row scope (slice 4 default mode).
  - /audit/entry/{id}: AP=true is required regardless of role; PO with
    AP=false is denied with ApFlagDenied (slice 5c strict mode). The
    endpoint returns full before / after JSON plus a server-computed
    shallow diff, so there is no metadata-only fallback for non-AP
    callers.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_audit_access
from app.db import get_session
from app.schemas.audit import AuditEntryDetail, AuditSearchEntry, AuditSearchResponse
from app.services.audit_entry import get_audit_entry
from app.services.audit_search import (
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    search_audit_entries,
)


router = APIRouter()


_AUDIT_SEARCH_RESOURCE = "audit_search"
_AUDIT_SEARCH_ALLOWED_ROLES = (
    "PortfolioOwner",
    "DeliveryDirector",
    "FinanceLead",
)

_AUDIT_ENTRY_RESOURCE = "audit_entry"
_AUDIT_ENTRY_ALLOWED_ROLES = (
    "PortfolioOwner",
    "DeliveryDirector",
    "FinanceLead",
)


@router.get(
    "/audit/search",
    response_model=AuditSearchResponse,
    status_code=200,
)
async def get_audit_search(
    actor_user_id: uuid.UUID | None = Query(default=None),
    resource_type: str | None = Query(default=None, max_length=64),
    resource_id: uuid.UUID | None = Query(default=None),
    http_method: str | None = Query(default=None, pattern="^(POST|PUT|PATCH|DELETE)$"),
    outcome: str | None = Query(
        default=None,
        pattern="^(Success|Denied|Error|ApFlagDenied|RoleDenied)$",
    ),
    time_window: str | None = Query(default=None, pattern="^(1h|24h|7d|30d)$"),
    cursor: str | None = Query(default=None),
    page_size: int = Query(
        default=PAGE_SIZE_DEFAULT,
        ge=1,
        le=PAGE_SIZE_MAX,
    ),
    user: CurrentUser = Depends(
        require_audit_access(_AUDIT_SEARCH_RESOURCE, *_AUDIT_SEARCH_ALLOWED_ROLES)
    ),
    session: AsyncSession = Depends(get_session),
) -> AuditSearchResponse:
    """Search the audit trail with role-scoped row visibility.

    Filters: actor_user_id, resource_type, resource_id, http_method, outcome,
    time_window. Cursor pagination on (occurred_at DESC, entry_id DESC).

    Scope (per kickoff):
      - PO/AP=true       -> all rows
      - PO/AP=false      -> own actions only (actor_user_id = self)
      - DD/AP=true       -> all rows (programme scoping deferred)
      - FL/AP=true       -> all rows (programme scoping deferred)
      - DD/AP=false      -> 403 ApFlagDenied (audit row written)
      - FL/AP=false      -> 403 ApFlagDenied (audit row written)
      - PM, HRBP, RO     -> 403 RoleDenied (audit row written)
    """
    rows, next_cursor, total_count = await search_audit_entries(
        session,
        caller_user_id=user.user_id,
        caller_role=user.role,
        caller_ap_flag=user.ap_flag,
        actor_user_id=actor_user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        http_method=http_method,
        outcome=outcome,
        time_window=time_window,
        cursor=cursor,
        page_size=page_size,
    )

    items = [AuditSearchEntry.model_validate(r, from_attributes=True) for r in rows]

    return AuditSearchResponse(
        items=items,
        next_cursor=next_cursor,
        total_count=total_count,
        page_size=page_size,
    )


@router.get(
    "/audit/entry/{entry_id}",
    response_model=AuditEntryDetail,
    status_code=200,
)
async def get_audit_entry_detail(
    entry_id: uuid.UUID = Path(...),
    user: CurrentUser = Depends(
        require_audit_access(
            _AUDIT_ENTRY_RESOURCE,
            *_AUDIT_ENTRY_ALLOWED_ROLES,
            strict_ap=True,
        )
    ),
    session: AsyncSession = Depends(get_session),
) -> AuditEntryDetail:
    """Return one audit row including before / after JSON and diff.

    Strict AP: every allowed role must have ap_flag=true; PortfolioOwner
    with AP=false is denied with ApFlagDenied (no own-actions carve-out
    here because there is no metadata-only fallback).

    diff is the shallow top-level delta between before_json and after_json;
    null when either side is null.

    Reads are not audited on success per D-039 ruling 8; denial paths
    (RoleDenied, ApFlagDenied) are audited by require_audit_access.
    404 is returned for an unknown entry_id with no audit row.
    """
    return await get_audit_entry(session, entry_id=entry_id)
