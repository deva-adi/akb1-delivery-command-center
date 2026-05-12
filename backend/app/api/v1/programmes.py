"""Programme-scoped read endpoints (M7-2 + M10-1).

M7-2 endpoints:
  GET /api/v1/programmes/{code}/raids
  GET /api/v1/programmes/{code}/milestones
  GET /api/v1/programmes/{code}/health

M10-1 additions:
  GET /api/v1/programmes                        (list all with health state)
  GET /api/v1/programmes/{code}                 (single programme detail)
  GET /api/v1/programmes/{code}/raids/{raid_id}
  GET /api/v1/programmes/{code}/milestones/{milestone_id}

Role access:
  PortfolioOwner: unrestricted
  DeliveryDirector, FinanceLead, ProgrammeManager: scoped to assignments
  HRBusinessPartner, ReadOnly: unrestricted read
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_programme_access, require_role
from app.db import get_session
from app.schemas.programmes import (
    HealthListResponse,
    HealthSnapshotItem,
    MilestoneItem,
    MilestoneListResponse,
    ProgrammeDetail,
    ProgrammeListItem,
    ProgrammeListResponse,
    ProgrammeMilestoneSummary,
    ProgrammeRaidSummary,
    RAIDItem,
    RAIDListResponse,
)
from app.services.get_milestone_item import get_milestone_item
from app.services.get_programme_detail import get_programme_detail
from app.services.get_raid_item import get_raid_item
from app.services.list_programmes_with_health import list_programmes_with_health
from app.services.programme_health import get_programme_health
from app.services.programme_milestones import get_programme_milestones
from app.services.programme_raids import get_programme_raids


router = APIRouter()

_ALL_ROLES = (
    "PortfolioOwner",
    "DeliveryDirector",
    "ProgrammeManager",
    "FinanceLead",
    "HRBusinessPartner",
    "ReadOnly",
)
_SCOPED_ROLES = frozenset({"DeliveryDirector", "ProgrammeManager", "FinanceLead"})
_UNRESTRICTED_ROLES = frozenset({"PortfolioOwner", "HRBusinessPartner", "ReadOnly"})


def _code_path(
    code: str = Path(
        ...,
        description="Programme code, e.g. PEGASUS",
        pattern=r"^[A-Za-z0-9_-]{1,64}$",
    ),
) -> str:
    return code.upper()


@router.get(
    "/programmes/{code}/raids",
    response_model=RAIDListResponse,
    status_code=200,
)
async def list_programme_raids(
    code: str = Depends(_code_path),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> RAIDListResponse:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    rows = await get_programme_raids(session, code)
    if rows is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Programme {code!r} not found")
    return RAIDListResponse(items=[RAIDItem.model_validate(r) for r in rows], count=len(rows))


@router.get(
    "/programmes/{code}/milestones",
    response_model=MilestoneListResponse,
    status_code=200,
)
async def list_programme_milestones(
    code: str = Depends(_code_path),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> MilestoneListResponse:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    rows = await get_programme_milestones(session, code)
    if rows is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Programme {code!r} not found")
    return MilestoneListResponse(items=[MilestoneItem.model_validate(r) for r in rows], count=len(rows))


@router.get(
    "/programmes/{code}/health",
    response_model=HealthListResponse,
    status_code=200,
)
async def list_programme_health(
    code: str = Depends(_code_path),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> HealthListResponse:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    rows = await get_programme_health(session, code)
    if rows is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Programme {code!r} not found")
    return HealthListResponse(items=[HealthSnapshotItem.model_validate(r) for r in rows], count=len(rows))


# ---------------------------------------------------------------------------
# M10-1: list all programmes with health state
# ---------------------------------------------------------------------------

@router.get(
    "/programmes",
    response_model=ProgrammeListResponse,
    status_code=200,
)
async def list_programmes(
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> ProgrammeListResponse:
    rows = await list_programmes_with_health(session)
    return ProgrammeListResponse(
        items=[
            ProgrammeListItem(
                programme_code=r.programme_code,
                programme_name=r.programme_name,
                health_state=r.health_state,
            )
            for r in rows
        ],
        count=len(rows),
    )


# ---------------------------------------------------------------------------
# M10-1: single programme detail
# ---------------------------------------------------------------------------

@router.get(
    "/programmes/{code}",
    response_model=ProgrammeDetail,
    status_code=200,
)
async def get_programme(
    code: str = Depends(_code_path),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> ProgrammeDetail:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    data = await get_programme_detail(session, code)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Programme {code!r} not found")

    return ProgrammeDetail(
        programme_code=data.programme_code,
        programme_name=data.programme_name,
        health_state=data.health_state,
        raid_summary=ProgrammeRaidSummary(
            total=data.raid_total,
            by_type=data.raid_by_type,
            by_severity=data.raid_by_severity,
        ),
        milestone_summary=ProgrammeMilestoneSummary(
            total=data.milestone_total,
            completed=data.milestone_completed,
            on_time_pct=data.on_time_pct,
        ),
        latest_snapshot_at=data.latest_snapshot_at,
    )


# ---------------------------------------------------------------------------
# M10-1: single RAID item detail
# ---------------------------------------------------------------------------

@router.get(
    "/programmes/{code}/raids/{raid_id}",
    response_model=RAIDItem,
    status_code=200,
)
async def get_raid(
    code: str = Depends(_code_path),
    raid_id: uuid.UUID = Path(..., description="RAID item UUID"),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> RAIDItem:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    item = await get_raid_item(session, code, raid_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RAID {raid_id!s} not found in programme {code!r}")
    return RAIDItem.model_validate(item)


# ---------------------------------------------------------------------------
# M10-1: single milestone detail
# ---------------------------------------------------------------------------

@router.get(
    "/programmes/{code}/milestones/{milestone_id}",
    response_model=MilestoneItem,
    status_code=200,
)
async def get_milestone(
    code: str = Depends(_code_path),
    milestone_id: uuid.UUID = Path(..., description="Milestone UUID"),
    user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> MilestoneItem:
    if user.role in _SCOPED_ROLES:
        await require_programme_access(code, user, session)

    item = await get_milestone_item(session, code, milestone_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Milestone {milestone_id!s} not found in programme {code!r}")
    return MilestoneItem.model_validate(item)
