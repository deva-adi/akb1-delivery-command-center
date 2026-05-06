"""Service layer for escalation_tier_config edits.

Per Q1 ruling: every escalation tier display string reads from
`escalation_tier_config.display_label` at render time. PATCHes here are
the only path that mutates that string. Per Q4 Option A: every mutation
writes a full-snapshot audit row in the same transaction.

Slice 2.2 refactor: rebound onto `update_with_audit` (services.audited_mutation)
so the audit-write pattern lives in one place. AuditWriter alias re-exported
here for backward-compat with the slice 2.5 import path.
"""

from __future__ import annotations

import datetime
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EscalationTierConfig
from app.services.audit import write_audit_entry
from app.services.audited_mutation import AuditWriter, update_with_audit


# Re-exported for backward compatibility with slice 2.5 imports
__all__ = ["AuditWriter", "update_tier_config"]


def _row_snapshot(row: EscalationTierConfig) -> dict[str, Any]:
    """Full row snapshot per Q4 Option A. Every field, never diffs."""
    return {
        "tier_number": row.tier_number,
        "default_label": row.default_label,
        "display_label": row.display_label,
        "description_text": row.description_text,
        "sla_hint_hours": row.sla_hint_hours,
        "role_mapping": row.role_mapping,
        "active": row.active,
        "last_edited_at": (
            row.last_edited_at.isoformat() if row.last_edited_at else None
        ),
        "last_edited_by_user_id": (
            str(row.last_edited_by_user_id) if row.last_edited_by_user_id else None
        ),
    }


async def update_tier_config(
    session: AsyncSession,
    *,
    tier_number: int,
    actor_user_id: uuid.UUID,
    actor_role: str,
    endpoint_path: str,
    display_label: str | None = None,
    description_text: str | None = None,
    active: bool | None = None,
    audit_writer: AuditWriter = write_audit_entry,
) -> EscalationTierConfig:
    """Apply changes to a tier_config row plus audit row in one transaction.

    Caller wraps in `async with session.begin():`. Raises 404 if
    tier_number does not exist.
    """

    def _mutate(row: EscalationTierConfig) -> None:
        if display_label is not None:
            row.display_label = display_label
        if description_text is not None:
            row.description_text = description_text
        if active is not None:
            row.active = active
        row.last_edited_at = datetime.datetime.now(datetime.timezone.utc)
        row.last_edited_by_user_id = actor_user_id

    return await update_with_audit(
        session,
        statement=(
            select(EscalationTierConfig)
            .where(EscalationTierConfig.tier_number == tier_number)
            .with_for_update()
        ),
        not_found_message=f"escalation tier {tier_number} not found",
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        endpoint_path=endpoint_path,
        http_method="PATCH",
        resource_type="escalation_tier_config",
        snapshot_fn=_row_snapshot,
        mutate_fn=_mutate,
        resource_id=None,  # tier_config PK is SMALLINT; tier_number lives in snapshots
        audit_writer=audit_writer,
    )
