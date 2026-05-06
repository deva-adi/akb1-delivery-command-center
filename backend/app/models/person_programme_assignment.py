"""person_programme_assignments join table (slice 5a).

Closes the slice 4 deferred TODO (D-040 ruling 2): backs the DD/FL
programme-scoped visibility filter on GET /api/v1/audit/search.

The programme_id column holds the programmes.programme_code natural key
(VARCHAR(32) UNIQUE) as TEXT, NOT the UUID. See migration 006 docstring
for the kickoff naming inconsistency note.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PersonProgrammeAssignment(Base):
    __tablename__ = "person_programme_assignments"

    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
    )
    programme_id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        nullable=False,
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
