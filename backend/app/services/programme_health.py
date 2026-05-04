"""Service for GET /api/v1/programmes/{code}/health."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, ProgrammeHealthSnapshot


async def get_programme_health(
    session: AsyncSession,
    programme_code: str,
) -> list[ProgrammeHealthSnapshot] | None:
    """Return all health snapshots for a programme, newest first.

    Returns None when the programme_code does not exist. The caller translates
    None to 404.
    """
    exists = await session.scalar(
        select(Programme.programme_code).where(
            Programme.programme_code == programme_code
        )
    )
    if exists is None:
        return None

    result = await session.execute(
        select(ProgrammeHealthSnapshot)
        .where(ProgrammeHealthSnapshot.programme_code == programme_code)
        .order_by(ProgrammeHealthSnapshot.snapshot_date.desc())
    )
    return list(result.scalars().all())
