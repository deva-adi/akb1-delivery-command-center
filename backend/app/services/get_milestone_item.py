"""Service for GET /api/v1/programmes/{code}/milestones/{milestone_id}."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ProgrammeMilestone


async def get_milestone_item(
    session: AsyncSession,
    programme_code: str,
    milestone_id: uuid.UUID,
) -> ProgrammeMilestone | None:
    """Return a single milestone, or None if not found or not in this programme."""
    return await session.scalar(
        select(ProgrammeMilestone).where(
            ProgrammeMilestone.milestone_id == milestone_id,
            ProgrammeMilestone.programme_code == programme_code,
        )
    )
