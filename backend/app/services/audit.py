"""Audit write helper.

Q4 Option A: every PATCH, POST, DELETE on a sensitive resource writes a
row containing both `before_json` and `after_json` as full row state, not
diffs. Caller controls the transaction boundary; this helper INSERTs into
the current session so failure rolls back the parent mutation.

The audit row is NOT eagerly flushed unless the surrounding transaction
flushes. The container endpoint should use `async with session.begin():`
so the session commits both the parent mutation and the audit row in one
atomic step.
"""

from __future__ import annotations

import datetime
import uuid
from typing import Any

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AuditTrailEntry


async def write_audit_entry(
    session: AsyncSession,
    *,
    actor_user_id: uuid.UUID,
    actor_role: str,
    endpoint: str,
    http_method: str,
    resource_type: str,
    resource_id: uuid.UUID | None = None,
    before_json: dict[str, Any] | None = None,
    after_json: dict[str, Any] | None = None,
    outcome: str = "Success",
    ip_address: str | None = None,
    user_agent: str | None = None,
    session_id: str | None = None,
) -> uuid.UUID:
    """INSERT one row into audit_trail_entries inside the caller's session.

    Returns the generated entry_id. Raises whatever the database driver
    raises on INSERT failure; the caller's transaction context is
    responsible for rolling back if this happens.
    """
    entry_id = uuid.uuid4()
    stmt = insert(AuditTrailEntry).values(
        entry_id=entry_id,
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        endpoint=endpoint,
        http_method=http_method,
        occurred_at=datetime.datetime.now(datetime.timezone.utc),
        outcome=outcome,
        resource_type=resource_type,
        resource_id=resource_id,
        before_json=before_json,
        after_json=after_json,
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id,
    )
    await session.execute(stmt)
    return entry_id
