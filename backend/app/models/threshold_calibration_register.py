"""threshold_calibration_register per Data Model PRD section 4.31.

Sixty metrics seeded covering rev 4 surface. Read by every intelligence
layer rule before colour assignment. Replaces hardcoded thresholds across
the codebase per Design Foundations R4.2 design rule.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class ThresholdCalibrationRegister(Base):
    __tablename__ = "threshold_calibration_register"

    metric_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)
    green_threshold: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    amber_threshold: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    red_threshold: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    range_lower: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    range_upper: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    rationale_text: Mapped[str] = mapped_column(Text, nullable=False)
    last_calibrated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    last_calibrated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("people.person_id", ondelete="RESTRICT"),
        nullable=False,
    )
    owning_role: Mapped[str] = mapped_column(String(32), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "direction IN ('HigherIsBetter','LowerIsBetter','RangeIsBetter')",
            name="threshold_calibration_register_direction_enum",
        ),
        CheckConstraint(
            "owning_role IN ('PortfolioOwner','FinanceLead','ProgrammeManager')",
            name="threshold_calibration_register_owning_role_enum",
        ),
    )
