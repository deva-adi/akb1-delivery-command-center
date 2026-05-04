"""Service for GET /api/v1/programmes/{code}/milestones."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, ProgrammeMilestone


async def get_programme_milestones(
    session: AsyncSession,
    programme_code: str,
) -> list[ProgrammeMilestone] | None:
    """Return all milestones for a programme, ordered by due_date.

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
        select(ProgrammeMilestone)
        .where(ProgrammeMilestone.programme_code == programme_code)
        .order_by(ProgrammeMilestone.due_date)
    )
    return list(result.scalars().all())
