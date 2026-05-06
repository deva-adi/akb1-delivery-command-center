"""Shared audited-mutation pattern.

Lifted out of tier_config.py and threshold_register.py during slice 2.2
once both endpoints proved the contract. Every PATCH on a sensitive
resource flows through `update_with_audit` so the Q4 Option A invariant
(full before / after snapshots written in the same transaction as the
parent mutation) is enforced in one place.

Mutating endpoints supply:
  - statement     : the SELECT ... FOR UPDATE that locks the row to mutate
  - not_found_message : the 404 detail when the row does not exist
  - snapshot_fn   : callable(row) -> dict, returns the full row state
  - mutate_fn     : callable(row) -> None, applies the field changes
  - audit identity: actor_user_id, actor_role, endpoint_path, http_method,
                    resource_type, resource_id

Atomic rollback is the responsibility of the caller's surrounding
`async with session.begin():` block; if `mutate_fn`, `snapshot_fn`, or
the audit writer raises, the parent transaction rolls back.
"""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar

from fastapi import HTTPException, status
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.audit import write_audit_entry


AuditWriter = Callable[..., Awaitable[uuid.UUID]]
RowT = TypeVar("RowT")
SnapshotFn = Callable[[RowT], dict[str, Any]]
MutateFn = Callable[[RowT], None]


async def update_with_audit(
    session: AsyncSession,
    *,
    statement: Select,
    not_found_message: str,
    actor_user_id: uuid.UUID,
    actor_role: str,
    endpoint_path: str,
    http_method: str,
    resource_type: str,
    snapshot_fn: SnapshotFn,
    mutate_fn: MutateFn,
    resource_id: uuid.UUID | None = None,
    audit_writer: AuditWriter = write_audit_entry,
) -> RowT:
    """Apply a mutation to one row plus write the audit row in one transaction.

    Raises 404 if the SELECT returns no row. Re-raises whatever the
    mutate_fn / snapshot_fn / audit_writer raises so the caller's
    `async with session.begin():` rolls back atomically.
    """
    result = await session.execute(statement)
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=not_found_message,
        )

    before_snapshot = snapshot_fn(row)
    mutate_fn(row)
    # Flush so the row holds its post-mutation state for the snapshot.
    # Any DB-level constraint violation (CHECK, FK, etc.) raises here and
    # rolls back the whole transaction via the caller's begin context.
    await session.flush()
    after_snapshot = snapshot_fn(row)

    await audit_writer(
        session,
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        endpoint=endpoint_path,
        http_method=http_method,
        resource_type=resource_type,
        resource_id=resource_id,
        before_json=before_snapshot,
        after_json=after_snapshot,
        outcome="Success",
    )

    return row
