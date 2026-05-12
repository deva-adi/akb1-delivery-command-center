"""Pydantic schemas for programme-scoped read endpoints (slice M7-2).

Covers: GET /api/v1/programmes/{code}/raids
        GET /api/v1/programmes/{code}/milestones
        GET /api/v1/programmes/{code}/health
"""

from __future__ import annotations

import datetime
import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict


RaidType = Literal["Risk", "Assumption", "Issue", "Dependency"]
Severity = Literal["Critical", "High", "Medium", "Low"]
RaidStatus = Literal["Open", "Escalated", "Mitigated", "Accepted", "Closed"]
MilestoneStatus = Literal["On Track", "At Risk", "Delayed", "Complete"]
Rag = Literal["Red", "Amber", "Green", "Watching", "Failing"]


class RAIDItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    raid_id: uuid.UUID
    programme_code: str
    raid_type: RaidType
    title: str
    description: str | None
    severity: Severity
    status: RaidStatus
    owner_user_id: uuid.UUID | None
    mitigation_date: datetime.date | None
    raised_date: datetime.date
    created_at: datetime.datetime
    updated_at: datetime.datetime


class RAIDListResponse(BaseModel):
    items: list[RAIDItem]
    count: int


class MilestoneItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    milestone_id: uuid.UUID
    programme_code: str
    title: str
    baseline_date: datetime.date | None
    due_date: datetime.date
    status: MilestoneStatus
    completion_pct: int
    created_at: datetime.datetime
    updated_at: datetime.datetime


class MilestoneListResponse(BaseModel):
    items: list[MilestoneItem]
    count: int


class HealthSnapshotItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    snapshot_id: uuid.UUID
    programme_code: str
    snapshot_date: datetime.date
    overall_rag: Rag
    schedule_rag: Rag | None
    budget_rag: Rag | None
    resources_rag: Rag | None
    risks_rag: Rag | None
    commentary: str | None
    captured_by_user_id: uuid.UUID
    created_at: datetime.datetime


class HealthListResponse(BaseModel):
    items: list[HealthSnapshotItem]
    count: int


class ProgrammeListItem(BaseModel):
    programme_code: str
    programme_name: str
    health_state: str | None


class ProgrammeListResponse(BaseModel):
    items: list[ProgrammeListItem]
    count: int


class ProgrammeRaidSummary(BaseModel):
    total: int
    by_type: dict[str, int]
    by_severity: dict[str, int]


class ProgrammeMilestoneSummary(BaseModel):
    total: int
    completed: int
    on_time_pct: float | None


class ProgrammeDetail(BaseModel):
    programme_code: str
    programme_name: str
    health_state: str | None
    raid_summary: ProgrammeRaidSummary
    milestone_summary: ProgrammeMilestoneSummary
    latest_snapshot_at: datetime.datetime | None
