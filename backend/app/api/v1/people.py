"""People read endpoint.

GET /api/v1/people returns seeded people with safe public fields.

Optional query params (M10-1):
  programme: filter by programme_code (joins people.programme_id -> programmes)
  band: filter by band column (e.g. B3)
  role: filter by role column (e.g. ProgrammeManager)

Without params, returns all 300. Reads are not audited.

Role access: all authenticated roles. The frontend Capability/Workforce tabs
enforce their own role gates; the backend serves data to any authenticated caller.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_role
from app.db import get_session
from app.schemas.people import PersonItem, PeopleListResponse
from app.services.people_service import list_people

router = APIRouter()

_ALL_ROLES = (
    "PortfolioOwner",
    "DeliveryDirector",
    "ProgrammeManager",
    "FinanceLead",
    "HRBusinessPartner",
    "ReadOnly",
)


@router.get(
    "/people",
    response_model=PeopleListResponse,
    status_code=200,
)
async def get_people_list(
    programme: str | None = Query(None, description="Filter by programme code"),
    band: str | None = Query(None, description="Filter by band (B1-B5)"),
    role: str | None = Query(None, description="Filter by role"),
    _user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> PeopleListResponse:
    rows = await list_people(session, programme=programme, band=band, role=role)
    return PeopleListResponse(
        items=[PersonItem.model_validate(r) for r in rows],
        count=len(rows),
    )
