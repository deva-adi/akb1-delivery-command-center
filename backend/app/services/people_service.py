"""Service for GET /api/v1/people."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.people import Person


async def list_people(session: AsyncSession) -> list[Person]:
    """Return all people ordered by band then full_name.

    Reads are not audited. No pagination for the v1.0.0 demo scale (300 rows).
    """
    result = await session.execute(
        select(Person).order_by(Person.band.asc().nulls_last(), Person.full_name.asc())
    )
    return list(result.scalars().all())
