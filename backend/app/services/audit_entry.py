"""Audit Console entry-detail service.

Slice 5c: GET /api/v1/audit/entry/{entry_id}. Returns one audit row with
before_json, after_json, and a server-computed shallow diff. Reads only;
no audit row is written for successful reads (per D-039 ruling 8). Denial
audit rows are written by the require_audit_access dependency before this
service is reached.

Diff semantics (slice 5c, shallow):
  - Top-level keys only. No recursion into nested objects or arrays.
  - added: keys present in after but not in before.
  - removed: keys present in before but not in after.
  - changed: keys in both with non-equal values; each entry carries a
    {'before': prior, 'after': new} pair.
  - diff is None when either snapshot is None.

Deep-diff (nested-path alignment, array index handling) is a future
enhancement and intentionally out of scope for slice 5c.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditTrailEntry
from app.schemas.audit import AuditEntryDetail, AuditEntryDiff


def compute_shallow_diff(
    before: dict[str, Any] | None,
    after: dict[str, Any] | None,
) -> AuditEntryDiff | None:
    """Top-level diff between two JSON payloads.

    Returns None if either side is None (caller has no basis to compute a
    delta). Returns an AuditEntryDiff with empty added / removed / changed
    when both sides are present and identical.
    """
    if before is None or after is None:
        return None

    before_keys = set(before.keys())
    after_keys = set(after.keys())

    added = {k: after[k] for k in sorted(after_keys - before_keys)}
    removed = {k: before[k] for k in sorted(before_keys - after_keys)}
    changed: dict[str, dict[str, Any]] = {}
    for k in sorted(before_keys & after_keys):
        if before[k] != after[k]:
            changed[k] = {"before": before[k], "after": after[k]}

    return AuditEntryDiff(added=added, removed=removed, changed=changed)


async def get_audit_entry(
    session: AsyncSession,
    *,
    entry_id: uuid.UUID,
) -> AuditEntryDetail:
    """Fetch one audit row by primary key and render the detail response.

    Raises 404 if the entry_id does not exist. Caller is responsible for
    the auth check (the route uses require_audit_access with strict_ap=True
    so AP=true is enforced before this service is called).
    """
    stmt = select(AuditTrailEntry).where(AuditTrailEntry.entry_id == entry_id)
    result = await session.execute(stmt)
    row = result.scalar_one_or_none()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit entry {entry_id} not found",
        )

    diff = compute_shallow_diff(row.before_json, row.after_json)

    return AuditEntryDetail(
        entry_id=row.entry_id,
        occurred_at=row.occurred_at,
        actor_user_id=row.actor_user_id,
        actor_role=row.actor_role,
        http_method=row.http_method,
        endpoint=row.endpoint,
        resource_type=row.resource_type,
        resource_id=row.resource_id,
        outcome=row.outcome,
        ip_address=row.ip_address,
        before_json=row.before_json,
        after_json=row.after_json,
        diff=diff,
    )
