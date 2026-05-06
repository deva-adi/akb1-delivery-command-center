"""escalation_tier_config per Data Model PRD section 4.73 (added per Q1).

Tier display labels render from `display_label` at request time so a tenant
rename of a tier propagates across every escalation surface without a code
change. Factory defaults seed `display_label = default_label`.

Edits are PO-only and write to `audit_trail_entries` with full before/after
snapshots per Q4 Option A.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class EscalationTierConfig(Base):
    __tablename__ = "escalation_tier_config"

    tier_number: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=False)
    default_label: Mapped[str] = mapped_column(String(64), nullable=False)
    display_label: Mapped[str] = mapped_column(String(64), nullable=False)
    description_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    sla_hint_hours: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    role_mapping: Mapped[dict] = mapped_column(JSONB, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    last_edited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    last_edited_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("people.person_id", ondelete="RESTRICT"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "tier_number BETWEEN 1 AND 9",
            name="escalation_tier_config_tier_number_range",
        ),
    )
