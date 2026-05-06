"""Admin Console endpoints.

Slice 2.5 (M6): PATCH /admin/tier-config/{n}.
Slice 2.1 (M6 round 2): PATCH /admin/threshold-register/{metric_id}.
Slice 3.3 (M6 round 3): GET /admin/tier-config, GET /admin/threshold-register.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser, require_role
from app.db import get_session
from app.models import EscalationTierConfig, ThresholdCalibrationRegister
from app.schemas.admin import (
    ThresholdRegisterList,
    ThresholdRegisterResponse,
    ThresholdRegisterUpdate,
    TierConfigList,
    TierConfigResponse,
    TierConfigUpdate,
)
from app.services.audit import write_audit_entry
from app.services.threshold_register import update_threshold
from app.services.tier_config import AuditWriter, update_tier_config


router = APIRouter()


def get_audit_writer() -> AuditWriter:
    """FastAPI dependency. Default returns the real audit writer; tests
    override this to inject a failing writer for the atomic-rollback test."""
    return write_audit_entry


@router.patch(
    "/admin/tier-config/{tier_number}",
    response_model=TierConfigResponse,
    status_code=200,
)
async def patch_tier_config(
    tier_number: int,
    body: TierConfigUpdate,
    request: Request,
    user: CurrentUser = Depends(require_role("PortfolioOwner")),
    session: AsyncSession = Depends(get_session),
    audit_writer: AuditWriter = Depends(get_audit_writer),
) -> TierConfigResponse:
    """PATCH a tier_config row.

    PO-only. Writes the full before / after snapshot to audit_trail_entries
    in the same transaction; if the audit write fails, the UPDATE rolls back.
    """
    async with session.begin():
        row = await update_tier_config(
            session,
            tier_number=tier_number,
            actor_user_id=user.user_id,
            actor_role=user.role,
            endpoint_path=request.url.path,
            display_label=body.display_label,
            description_text=body.description_text,
            active=body.active,
            audit_writer=audit_writer,
        )
        # Snapshot the values BEFORE the session.begin() context exits and
        # closes the session-bound row. ORM attribute access on a closed
        # session would raise; capturing into the response model here
        # keeps the response intact across the transaction boundary.
        response = TierConfigResponse.model_validate(row, from_attributes=True)
    return response


@router.get(
    "/admin/tier-config",
    response_model=TierConfigList,
    status_code=200,
)
async def get_tier_config_list(
    user: CurrentUser = Depends(require_role("PortfolioOwner")),
    session: AsyncSession = Depends(get_session),
) -> TierConfigList:
    """Read every escalation tier config. PO-only. Reads not audited."""
    stmt = select(EscalationTierConfig).order_by(EscalationTierConfig.tier_number)
    result = await session.execute(stmt)
    rows = result.scalars().all()
    items = [TierConfigResponse.model_validate(r, from_attributes=True) for r in rows]
    return TierConfigList(items=items)


@router.get(
    "/admin/threshold-register",
    response_model=ThresholdRegisterList,
    status_code=200,
)
async def get_threshold_register_list(
    user: CurrentUser = Depends(require_role("PortfolioOwner")),
    session: AsyncSession = Depends(get_session),
) -> ThresholdRegisterList:
    """Read every threshold calibration register row. PO-only. Reads not audited."""
    stmt = select(ThresholdCalibrationRegister).order_by(
        ThresholdCalibrationRegister.metric_id
    )
    result = await session.execute(stmt)
    rows = result.scalars().all()
    items = [
        ThresholdRegisterResponse.model_validate(r, from_attributes=True)
        for r in rows
    ]
    return ThresholdRegisterList(items=items)


@router.patch(
    "/admin/threshold-register/{metric_id}",
    response_model=ThresholdRegisterResponse,
    status_code=200,
)
async def patch_threshold_register(
    metric_id: str,
    body: ThresholdRegisterUpdate,
    request: Request,
    user: CurrentUser = Depends(require_role("PortfolioOwner")),
    session: AsyncSession = Depends(get_session),
    audit_writer: AuditWriter = Depends(get_audit_writer),
) -> ThresholdRegisterResponse:
    """PATCH a threshold_calibration_register row.

    PO-only. Writes the full before / after snapshot to audit_trail_entries
    in the same transaction; if the audit write fails, the UPDATE rolls back.
    """
    async with session.begin():
        row = await update_threshold(
            session,
            metric_id=metric_id,
            actor_user_id=user.user_id,
            actor_role=user.role,
            endpoint_path=request.url.path,
            display_name=body.display_name,
            direction=body.direction,
            green_threshold=body.green_threshold,
            amber_threshold=body.amber_threshold,
            red_threshold=body.red_threshold,
            range_lower=body.range_lower,
            range_upper=body.range_upper,
            rationale_text=body.rationale_text,
            owning_role=body.owning_role,
            audit_writer=audit_writer,
        )
        response = ThresholdRegisterResponse.model_validate(row, from_attributes=True)
    return response
