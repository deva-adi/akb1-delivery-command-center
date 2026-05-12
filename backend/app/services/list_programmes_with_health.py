"""Service for GET /api/v1/programmes (list with current health state)."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, ProgrammeHealthSnapshot


@dataclass
class ProgrammeWithHealth:
    programme_code: str
    programme_name: str
    health_state: str | None


async def list_programmes_with_health(
    session: AsyncSession,
) -> list[ProgrammeWithHealth]:
    """Return all programmes with their latest overall_rag, ordered by code.

    Uses a correlated max(snapshot_date) subquery to pick the latest snapshot
    per programme. Programmes with no snapshots get health_state=None.
    """
    latest_date_sq = (
        select(
            ProgrammeHealthSnapshot.programme_code,
            func.max(ProgrammeHealthSnapshot.snapshot_date).label("max_date"),
        )
        .group_by(ProgrammeHealthSnapshot.programme_code)
        .subquery()
    )

    stmt = (
        select(
            Programme.programme_code,
            Programme.name,
            ProgrammeHealthSnapshot.overall_rag,
        )
        .outerjoin(
            latest_date_sq,
            latest_date_sq.c.programme_code == Programme.programme_code,
        )
        .outerjoin(
            ProgrammeHealthSnapshot,
            (ProgrammeHealthSnapshot.programme_code == Programme.programme_code)
            & (ProgrammeHealthSnapshot.snapshot_date == latest_date_sq.c.max_date),
        )
        .order_by(Programme.programme_code)
    )

    rows = (await session.execute(stmt)).all()
    return [
        ProgrammeWithHealth(
            programme_code=row.programme_code,
            programme_name=row.name,
            health_state=row.overall_rag,
        )
        for row in rows
    ]
