"""People read schemas.

PersonItem: safe public shape for GET /api/v1/people.
Excluded: email (PII), password_hash (never exposed),
          programme_id (internal FK), created_at, updated_at.
"""

from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict


class PersonItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    person_id: uuid.UUID
    full_name: str
    role: str
    band: str | None
    ap_flag: bool
    overtime_hours_mtd: float | None
    last_1on1_sentiment_score: int | None


class PeopleListResponse(BaseModel):
    items: list[PersonItem]
    count: int
