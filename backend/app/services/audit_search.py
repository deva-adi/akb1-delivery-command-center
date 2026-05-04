"""Audit Console search service.

Slice 4:  GET /api/v1/audit/search.
Slice 5a: programme scoping for DD/FL via person_programme_assignments (5a-narrow).
Slice M7-2: 5a-broad extension: resource ownership scoping for programme_raid,
            programme_milestone, programme_health_snapshot rows.

Cursor-based pagination on (occurred_at DESC, entry_id DESC). Cursor is
an opaque base64 JSON payload carrying the last row's (occurred_at, entry_id);
clients pass it back to fetch the next page. next_cursor is null when the
current page is the last.

Row scope rules (5a-narrow + 5a-broad combined):
  - PortfolioOwner with AP true:  all rows
  - PortfolioOwner with AP false: own actions only (actor_user_id = caller)
  - DeliveryDirector with AP true: rows where EITHER
      (a) actor_user_id is assigned to one of the caller's programmes, OR
      (b) resource_type is programme_raid/milestone/health_snapshot AND
          resource_id belongs to one of the caller's programmes.
  - FinanceLead with AP true: same combined rule as DeliveryDirector.
  - All other paths return 403 via require_audit_access dependency.
"""

from __future__ import annotations

import base64
import binascii
import datetime
import json
import uuid

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AuditTrailEntry,
    PersonProgrammeAssignment,
    ProgrammeHealthSnapshot,
    ProgrammeMilestone,
    ProgrammeRaid,
)


PAGE_SIZE_DEFAULT = 50
PAGE_SIZE_MAX = 200


def _encode_cursor(occurred_at: datetime.datetime, entry_id: uuid.UUID) -> str:
    payload = {"ts": occurred_at.isoformat(), "id": str(entry_id)}
    return base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("ascii")


def _decode_cursor(cursor: str) -> tuple[datetime.datetime, uuid.UUID]:
    try:
        decoded = base64.urlsafe_b64decode(cursor.encode("ascii")).decode("utf-8")
        payload = json.loads(decoded)
        ts = datetime.datetime.fromisoformat(payload["ts"])
        eid = uuid.UUID(payload["id"])
        return ts, eid
    except (binascii.Error, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cursor: {exc}",
        ) from exc


def _resolve_time_window(
    time_window: str | None,
    now: datetime.datetime,
) -> datetime.datetime | None:
    """Map a friendly time-window string to a 'since' timestamp.

    Accepted values: '1h', '24h', '7d', '30d'. Returns None for None.
    Raises 400 on unknown values.
    """
    if time_window is None:
        return None
    table = {
        "1h": datetime.timedelta(hours=1),
        "24h": datetime.timedelta(hours=24),
        "7d": datetime.timedelta(days=7),
        "30d": datetime.timedelta(days=30),
    }
    delta = table.get(time_window)
    if delta is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid time_window {time_window!r}; expected one of {sorted(table)}",
        )
    return now - delta


async def search_audit_entries(
    session: AsyncSession,
    *,
    caller_user_id: uuid.UUID,
    caller_role: str,
    caller_ap_flag: bool,
    actor_user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    resource_id: uuid.UUID | None = None,
    http_method: str | None = None,
    outcome: str | None = None,
    time_window: str | None = None,
    cursor: str | None = None,
    page_size: int = PAGE_SIZE_DEFAULT,
) -> tuple[list[AuditTrailEntry], str | None, int]:
    """Filtered, paginated, role-scoped audit search.

    Returns (rows, next_cursor, total_count). Caller is responsible for
    the auth check; this function trusts caller_role and caller_ap_flag.
    """
    if page_size < 1:
        page_size = PAGE_SIZE_DEFAULT
    if page_size > PAGE_SIZE_MAX:
        page_size = PAGE_SIZE_MAX

    base = select(AuditTrailEntry)

    # Row scope:
    #   PO without AP -> own actions only.
    #   PO with AP    -> all rows.
    #   DD/FL with AP -> 5a-narrow + 5a-broad (combined OR):
    #     5a-narrow: actor_user_id is assigned to one of the caller's programmes.
    #     5a-broad:  resource belongs to one of the caller's programmes; covers
    #                programme_raid, programme_milestone, programme_health_snapshot
    #                rows written when those resources are mutated. Two-level
    #                scalar subquery for actor scoping; single-level for resource
    #                scoping (resource_id is the UUID PK of the resource row).
    if caller_role == "PortfolioOwner" and not caller_ap_flag:
        base = base.where(AuditTrailEntry.actor_user_id == caller_user_id)
    elif caller_role in ("DeliveryDirector", "FinanceLead") and caller_ap_flag:
        caller_programmes = (
            select(PersonProgrammeAssignment.programme_id)
            .where(PersonProgrammeAssignment.person_id == caller_user_id)
            .scalar_subquery()
        )
        in_caller_programmes = (
            select(PersonProgrammeAssignment.person_id)
            .where(PersonProgrammeAssignment.programme_id.in_(caller_programmes))
            .scalar_subquery()
        )
        raid_ids = (
            select(ProgrammeRaid.raid_id)
            .where(ProgrammeRaid.programme_code.in_(caller_programmes))
            .scalar_subquery()
        )
        milestone_ids = (
            select(ProgrammeMilestone.milestone_id)
            .where(ProgrammeMilestone.programme_code.in_(caller_programmes))
            .scalar_subquery()
        )
        snapshot_ids = (
            select(ProgrammeHealthSnapshot.snapshot_id)
            .where(ProgrammeHealthSnapshot.programme_code.in_(caller_programmes))
            .scalar_subquery()
        )
        base = base.where(
            or_(
                AuditTrailEntry.actor_user_id.in_(in_caller_programmes),
                and_(
                    AuditTrailEntry.resource_type == "programme_raid",
                    AuditTrailEntry.resource_id.in_(raid_ids),
                ),
                and_(
                    AuditTrailEntry.resource_type == "programme_milestone",
                    AuditTrailEntry.resource_id.in_(milestone_ids),
                ),
                and_(
                    AuditTrailEntry.resource_type == "programme_health_snapshot",
                    AuditTrailEntry.resource_id.in_(snapshot_ids),
                ),
            )
        )

    # Caller-provided filters
    if actor_user_id is not None:
        base = base.where(AuditTrailEntry.actor_user_id == actor_user_id)
    if resource_type is not None:
        base = base.where(AuditTrailEntry.resource_type == resource_type)
    if resource_id is not None:
        base = base.where(AuditTrailEntry.resource_id == resource_id)
    if http_method is not None:
        base = base.where(AuditTrailEntry.http_method == http_method)
    if outcome is not None:
        base = base.where(AuditTrailEntry.outcome == outcome)
    since = _resolve_time_window(time_window, datetime.datetime.now(datetime.timezone.utc))
    if since is not None:
        base = base.where(AuditTrailEntry.occurred_at >= since)

    # Total count uses the same filters but no cursor / order / limit.
    count_stmt = select(func.count()).select_from(base.subquery())
    total_count = (await session.execute(count_stmt)).scalar_one()

    # Apply cursor
    page_stmt = base
    if cursor is not None:
        ts, eid = _decode_cursor(cursor)
        page_stmt = page_stmt.where(
            or_(
                AuditTrailEntry.occurred_at < ts,
                and_(
                    AuditTrailEntry.occurred_at == ts,
                    AuditTrailEntry.entry_id < eid,
                ),
            )
        )

    page_stmt = page_stmt.order_by(
        AuditTrailEntry.occurred_at.desc(),
        AuditTrailEntry.entry_id.desc(),
    ).limit(page_size + 1)

    result = await session.execute(page_stmt)
    rows = list(result.scalars().all())

    next_cursor: str | None = None
    if len(rows) > page_size:
        # We fetched one extra to detect "more"; use the last row of the page
        # (index page_size - 1) to compute next_cursor; drop the extra.
        rows = rows[:page_size]
        last = rows[-1]
        next_cursor = _encode_cursor(last.occurred_at, last.entry_id)

    return rows, next_cursor, total_count
