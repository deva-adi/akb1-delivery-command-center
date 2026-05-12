"""Service for GET /api/v1/programmes/{code}/raids/{raid_id}."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ProgrammeRaid


async def get_raid_item(
    session: AsyncSession,
    programme_code: str,
    raid_id: uuid.UUID,
) -> ProgrammeRaid | None:
    """Return a single RAID item, or None if not found or not in this programme."""
    return await session.scalar(
        select(ProgrammeRaid).where(
            ProgrammeRaid.raid_id == raid_id,
            ProgrammeRaid.programme_code == programme_code,
        )
    )
