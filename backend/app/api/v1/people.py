"""People read endpoint.

GET /api/v1/people returns all 300 seeded people with safe public fields.
Reads are not audited. No pagination needed at demo scale.

Role access: all authenticated roles. The frontend Capability tab enforces
its own role gate; the backend serves aggregate headcount data to any
authenticated caller without restriction.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
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
    _user: CurrentUser = Depends(require_role(*_ALL_ROLES)),
    session: AsyncSession = Depends(get_session),
) -> PeopleListResponse:
    """Return all people. Reads not audited."""
    rows = await list_people(session)
    return PeopleListResponse(
        items=[PersonItem.model_validate(r) for r in rows],
        count=len(rows),
    )
