"""Service for GET /api/v1/programmes/{code} (single programme detail)."""

from __future__ import annotations

import datetime
from dataclasses import dataclass, field

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Programme, ProgrammeHealthSnapshot, ProgrammeMilestone, ProgrammeRaid


@dataclass
class ProgrammeDetailData:
    programme_code: str
    programme_name: str
    health_state: str | None
    raid_total: int
    raid_by_type: dict[str, int]
    raid_by_severity: dict[str, int]
    milestone_total: int
    milestone_completed: int
    on_time_pct: float | None
    latest_snapshot_at: datetime.datetime | None


async def get_programme_detail(
    session: AsyncSession,
    programme_code: str,
) -> ProgrammeDetailData | None:
    """Return full detail for one programme, or None if code not found."""
    programme = await session.scalar(
        select(Programme).where(Programme.programme_code == programme_code)
    )
    if programme is None:
        return None

    # Latest health snapshot
    latest_snapshot = await session.scalar(
        select(ProgrammeHealthSnapshot)
        .where(ProgrammeHealthSnapshot.programme_code == programme_code)
        .order_by(ProgrammeHealthSnapshot.snapshot_date.desc())
        .limit(1)
    )

    # RAID summary
    raid_rows = (
        await session.execute(
            select(ProgrammeRaid.raid_type, ProgrammeRaid.severity)
            .where(ProgrammeRaid.programme_code == programme_code)
        )
    ).all()

    raid_by_type: dict[str, int] = {}
    raid_by_severity: dict[str, int] = {}
    for row in raid_rows:
        raid_by_type[row.raid_type] = raid_by_type.get(row.raid_type, 0) + 1
        raid_by_severity[row.severity] = raid_by_severity.get(row.severity, 0) + 1

    # Milestone summary
    milestone_rows = (
        await session.execute(
            select(ProgrammeMilestone.status)
            .where(ProgrammeMilestone.programme_code == programme_code)
        )
    ).all()

    milestone_total = len(milestone_rows)
    milestone_completed = sum(1 for r in milestone_rows if r.status == "Complete")
    on_time_pct = (
        round(milestone_completed / milestone_total * 100, 1)
        if milestone_total > 0
        else None
    )

    return ProgrammeDetailData(
        programme_code=programme.programme_code,
        programme_name=programme.name,
        health_state=latest_snapshot.overall_rag if latest_snapshot else None,
        raid_total=len(raid_rows),
        raid_by_type=raid_by_type,
        raid_by_severity=raid_by_severity,
        milestone_total=milestone_total,
        milestone_completed=milestone_completed,
        on_time_pct=on_time_pct,
        latest_snapshot_at=latest_snapshot.created_at if latest_snapshot else None,
    )
