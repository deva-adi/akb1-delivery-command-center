"""Service layer for threshold_calibration_register edits.

Per Design Foundations R4.2: every intelligence layer rule reads green /
amber / red boundaries from this register at request time. PO with
calibration authority PATCHes here through the Admin Console; every edit
writes a full-snapshot audit row in the same transaction per Q4 Option A.

Slice 2.2 refactor: rebound onto `update_with_audit` (services.audited_mutation).
"""

from __future__ import annotations

import datetime
import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ThresholdCalibrationRegister
from app.services.audit import write_audit_entry
from app.services.audited_mutation import AuditWriter, update_with_audit


__all__ = ["update_threshold"]


def _row_snapshot(row: ThresholdCalibrationRegister) -> dict[str, Any]:
    """Full row snapshot per Q4 Option A. Decimal columns serialise as
    string for clean JSON (avoids float-precision surprises)."""
    return {
        "metric_id": row.metric_id,
        "display_name": row.display_name,
        "direction": row.direction,
        "green_threshold": str(row.green_threshold) if row.green_threshold is not None else None,
        "amber_threshold": str(row.amber_threshold) if row.amber_threshold is not None else None,
        "red_threshold": str(row.red_threshold) if row.red_threshold is not None else None,
        "range_lower": str(row.range_lower) if row.range_lower is not None else None,
        "range_upper": str(row.range_upper) if row.range_upper is not None else None,
        "rationale_text": row.rationale_text,
        "last_calibrated_at": (
            row.last_calibrated_at.isoformat() if row.last_calibrated_at else None
        ),
        "last_calibrated_by": (
            str(row.last_calibrated_by) if row.last_calibrated_by else None
        ),
        "owning_role": row.owning_role,
    }


async def update_threshold(
    session: AsyncSession,
    *,
    metric_id: str,
    actor_user_id: uuid.UUID,
    actor_role: str,
    endpoint_path: str,
    display_name: str | None = None,
    direction: str | None = None,
    green_threshold: Decimal | None = None,
    amber_threshold: Decimal | None = None,
    red_threshold: Decimal | None = None,
    range_lower: Decimal | None = None,
    range_upper: Decimal | None = None,
    rationale_text: str | None = None,
    owning_role: str | None = None,
    audit_writer: AuditWriter = write_audit_entry,
) -> ThresholdCalibrationRegister:
    """Apply changes to a threshold register row plus audit row in one txn.

    Caller wraps in `async with session.begin():`. Raises 404 if metric_id
    does not exist.
    """

    def _mutate(row: ThresholdCalibrationRegister) -> None:
        if display_name is not None:
            row.display_name = display_name
        if direction is not None:
            row.direction = direction
        if green_threshold is not None:
            row.green_threshold = green_threshold
        if amber_threshold is not None:
            row.amber_threshold = amber_threshold
        if red_threshold is not None:
            row.red_threshold = red_threshold
        if range_lower is not None:
            row.range_lower = range_lower
        if range_upper is not None:
            row.range_upper = range_upper
        if rationale_text is not None:
            row.rationale_text = rationale_text
        if owning_role is not None:
            row.owning_role = owning_role
        row.last_calibrated_at = datetime.datetime.now(datetime.timezone.utc)
        row.last_calibrated_by = actor_user_id

    return await update_with_audit(
        session,
        statement=(
            select(ThresholdCalibrationRegister)
            .where(ThresholdCalibrationRegister.metric_id == metric_id)
            .with_for_update()
        ),
        not_found_message=f"threshold metric '{metric_id}' not found",
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        endpoint_path=endpoint_path,
        http_method="PATCH",
        resource_type="threshold_calibration_register",
        snapshot_fn=_row_snapshot,
        mutate_fn=_mutate,
        resource_id=None,  # PK is varchar metric_id; carried in snapshots
        audit_writer=audit_writer,
    )
