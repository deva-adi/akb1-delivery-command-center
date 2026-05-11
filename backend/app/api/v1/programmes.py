"""Programme-scoped read endpoints (slice M7-2).

GET /api/v1/programmes/{code}/raids
GET /api/v1/programmes/{code}/milestones
GET /api/v1/programmes/{code}/health

Role access per Adi's M7-2 kickoff:
  - PortfolioOwner: unrestricted (all programmes)
  - DeliveryDirector: scoped to person_programme_assignments
  - FinanceLead:      scoped to person_programme_assignments
  - ProgrammeManager: scoped to person_programme_assignments (same code path
                      as DD/FL; each PM has one assignment row from seed)
  - HRBusinessPartner: unrestricted read
  - ReadOnly:          unrestricted read

Unrestricted roles (PO, HRBP, RO) reach the service directly after the 404
guard. Scoped roles (DD, FL, PM) first pass through require_programme_access
which 403s when the programme is not in their assignments.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_programme_access, require_role
from app.db import get_session
from app.schemas.programmes import (
    HealthListResponse,
    HealthSnapshotItem,
    MilestoneItem,
    MilestoneListResponse,
    RAIDItem,
    RAIDListResponse,
)
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
