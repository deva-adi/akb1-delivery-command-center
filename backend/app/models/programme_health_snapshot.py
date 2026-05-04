"""ORM model for programme_health_snapshots (slice M7-2)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class ProgrammeHealthSnapshot(Base):
    __tablename__ = "programme_health_snapshots"

    snapshot_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    programme_code: Mapped[str] = mapped_column(String(32), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    overall_rag: Mapped[str] = mapped_column(String(16), nullable=False)
    schedule_rag: Mapped[str | None] = mapped_column(String(16), nullable=True)
    budget_rag: Mapped[str | None] = mapped_column(String(16), nullable=True)
    resources_rag: Mapped[str | None] = mapped_column(String(16), nullable=True)
    risks_rag: Mapped[str | None] = mapped_column(String(16), nullable=True)
    commentary: Mapped[str | None] = mapped_column(Text, nullable=True)
    captured_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
