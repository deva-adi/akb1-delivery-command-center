"""people (rev 2 baseline plus rev 3 fields).

Rev 3 expansion per Data Model PRD section 4.2:
  + overtime_hours_mtd numeric(5,2)
  + last_1on1_sentiment_score smallint nullable CHECK between 0 and 100

`ap_flag` column is the per-Q3-ruling Audit Permission flag, additive on PO,
DD, or FL accounts. Default false. AP role-binding is enforced at the
application layer in slice 5 onward.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, DateTime, Numeric, SmallInteger, String, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Person(Base):
    __tablename__ = "people"

    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    ap_flag: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
    )
    password_hash: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        server_default="",
    )
    band: Mapped[str | None] = mapped_column(String(8), nullable=True)
    programme_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    overtime_hours_mtd: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    last_1on1_sentiment_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        CheckConstraint(
            "last_1on1_sentiment_score IS NULL "
            "OR (last_1on1_sentiment_score BETWEEN 0 AND 100)",
            name="people_last_1on1_sentiment_score_range",
        ),
        CheckConstraint(
            "role IN ('PortfolioOwner','DeliveryDirector','ProgrammeManager',"
            "'FinanceLead','HRBusinessPartner','ReadOnly')",
            name="people_role_enum",
        ),
    )
