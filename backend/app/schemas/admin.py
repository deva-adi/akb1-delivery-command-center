"""Admin console request and response schemas.

Slice 2.5 (M6): TierConfigUpdate / TierConfigResponse for PATCH /admin/tier-config/{n}.
Slice 2.1 (M6 round 2): ThresholdRegisterUpdate / ThresholdRegisterResponse for
PATCH /admin/threshold-register/{metric_id}.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TierConfigUpdate(BaseModel):
    """Body for PATCH /api/v1/admin/tier-config/{tier_number}.

    All fields optional; at least one must be provided. extra='forbid'
    rejects unknown keys so contract drift is caught at the boundary.
    """

    model_config = ConfigDict(extra="forbid")

    display_label: str | None = Field(default=None, min_length=1, max_length=64)
    description_text: str | None = Field(default=None)
    active: bool | None = Field(default=None)

    @model_validator(mode="after")
    def at_least_one_field(self) -> TierConfigUpdate:
        if all(v is None for v in (self.display_label, self.description_text, self.active)):
            raise ValueError(
                "At least one of display_label, description_text, active is required"
            )
        return self


class TierConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tier_number: int
    default_label: str
    display_label: str
    description_text: str | None
    sla_hint_hours: int | None
    role_mapping: dict[str, Any]
    active: bool
    last_edited_at: datetime
    last_edited_by_user_id: uuid.UUID


_DIRECTION_VALUES = ("HigherIsBetter", "LowerIsBetter", "RangeIsBetter")
_OWNING_ROLE_VALUES = ("PortfolioOwner", "FinanceLead", "ProgrammeManager")


class ThresholdRegisterUpdate(BaseModel):
    """Body for PATCH /api/v1/admin/threshold-register/{metric_id}.

    All fields optional; at least one must be provided. extra='forbid'
    rejects unknown keys. Setting range_lower / range_upper to null in
    the request body is treated as "no change" in this slice; emptying
    those fields requires a separate slice when needed (see slice 2 hand-back).

    metric_id is the URL path param and not editable. last_calibrated_at
    and last_calibrated_by are system-set on every PATCH.
    """

    model_config = ConfigDict(extra="forbid")

    display_name: str | None = Field(default=None, min_length=1, max_length=128)
    direction: str | None = Field(
        default=None, pattern=f"^({'|'.join(_DIRECTION_VALUES)})$"
    )
    green_threshold: Decimal | None = Field(default=None)
    amber_threshold: Decimal | None = Field(default=None)
    red_threshold: Decimal | None = Field(default=None)
    range_lower: Decimal | None = Field(default=None)
    range_upper: Decimal | None = Field(default=None)
    rationale_text: str | None = Field(default=None, min_length=1)
    owning_role: str | None = Field(
        default=None, pattern=f"^({'|'.join(_OWNING_ROLE_VALUES)})$"
    )

    @model_validator(mode="after")
    def at_least_one_field(self) -> ThresholdRegisterUpdate:
        if all(
            v is None
            for v in (
                self.display_name,
                self.direction,
                self.green_threshold,
                self.amber_threshold,
                self.red_threshold,
                self.range_lower,
                self.range_upper,
                self.rationale_text,
                self.owning_role,
            )
        ):
            raise ValueError(
                "At least one of display_name, direction, green_threshold, "
                "amber_threshold, red_threshold, range_lower, range_upper, "
                "rationale_text, owning_role is required"
            )
        return self


class ThresholdRegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metric_id: str
    display_name: str
    direction: str
    green_threshold: Decimal
    amber_threshold: Decimal
    red_threshold: Decimal
    range_lower: Decimal | None
    range_upper: Decimal | None
    rationale_text: str
    last_calibrated_at: datetime
    last_calibrated_by: uuid.UUID
    owning_role: str


class TierConfigList(BaseModel):
    """GET /api/v1/admin/tier-config response. Wrapped list for forward
    extensibility (pagination, total_count when row counts grow)."""

    items: list[TierConfigResponse]


class ThresholdRegisterList(BaseModel):
    """GET /api/v1/admin/threshold-register response."""

    items: list[ThresholdRegisterResponse]
