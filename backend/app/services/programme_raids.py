"""Service for GET /api/v1/programmes/{code}/raids."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, ProgrammeRaid


async def get_programme_raids(
    session: AsyncSession,
    programme_code: str,
) -> list[ProgrammeRaid] | None:
    """Return all RAID items for a programme, ordered by severity then raised_date.

    Returns None when the programme_code does not exist. The caller translates
    None to 404 so the 404 path does not write an audit row (reads not audited).
    """
    exists = await session.scalar(
        select(Programme.programme_code).where(
            Programme.programme_code == programme_code
        )
    )
    if exists is None:
        return None

    result = await session.execute(
        select(ProgrammeRaid)
        .where(ProgrammeRaid.programme_code == programme_code)
        .order_by(
            ProgrammeRaid.severity,
            ProgrammeRaid.raised_date.desc(),
        )
    )
    return list(result.scalars().all())
