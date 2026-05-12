"""Service for GET /api/v1/people."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.people import Person
from app.models.programmes import Programme


async def list_people(
    session: AsyncSession,
    *,
    programme: str | None = None,
    band: str | None = None,
    role: str | None = None,
) -> list[Person]:
    """Return people ordered by band then full_name.

    Optional filters:
      programme: programme_code -- filters via people.programme_id -> programmes.programme_code
      band: people.band column value (e.g. "B3")
      role: people.role column value (e.g. "ProgrammeManager")

    Reads are not audited. No pagination for the v1.0.0 demo scale (300 rows).
    """
    stmt = select(Person)

    if programme is not None:
        programme_code = programme.upper()
        stmt = stmt.join(
            Programme,
            (Programme.programme_id == Person.programme_id)
            & (Programme.programme_code == programme_code),
        )

    if band is not None:
        stmt = stmt.where(Person.band == band)

    if role is not None:
        stmt = stmt.where(Person.role == role)

    stmt = stmt.order_by(Person.band.asc().nulls_last(), Person.full_name.asc())
    result = await session.execute(stmt)
    return list(result.scalars().all())
