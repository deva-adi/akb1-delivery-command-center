"""audit_trail_entries per Data Model PRD section 4.71.

Append-only at every layer:
  - REVOKE UPDATE, DELETE FROM PUBLIC, akb1_owner, akb1_app
  - ENABLE plus FORCE ROW LEVEL SECURITY (binds even the table owner)
  - INSERT policy WITH CHECK (true), SELECT policy USING (true)
  - No UPDATE policy, no DELETE policy -> implicit deny

Q4 Option A rule: every PATCH, POST, DELETE on a sensitive resource writes
a row here with both `before_json` and `after_json` populated as full row
state, never diffs. Enforced in the service layer in slice 5.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class AuditTrailEntry(Base):
    __tablename__ = "audit_trail_entries"

    entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
    )
    actor_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("people.person_id", ondelete="RESTRICT"),
        nullable=False,
    )
    actor_role: Mapped[str] = mapped_column(String(64), nullable=False)
    endpoint: Mapped[str] = mapped_column(String(256), nullable=False)
    http_method: Mapped[str] = mapped_column(String(8), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    outcome: Mapped[str] = mapped_column(String(16), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    before_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    after_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(256), nullable=True)
    session_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "http_method IN ('GET','POST','PUT','PATCH','DELETE')",
            name="audit_trail_entries_method_enum",
        ),
        CheckConstraint(
            "outcome IN ('Success','Denied','Error','ApFlagDenied','RoleDenied')",
            name="audit_trail_entries_outcome_enum",
        ),
    )
