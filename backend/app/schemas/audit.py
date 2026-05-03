"""Audit Console schemas.

Slice 4: GET /api/v1/audit/search returns AuditSearchEntry rows (metadata
only). The full before / after JSON payloads stay UNRENDERED in search
responses to keep them small and so non-AP callers cannot indirectly
read mutation deltas.

Slice 5c: GET /api/v1/audit/entry/{entry_id} returns AuditEntryDetail
which DOES render before_json, after_json, and a server-computed shallow
diff. The endpoint is AP-strict (require_audit_access with strict_ap=True)
so even PortfolioOwner without AP cannot reach the diff.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AuditSearchEntry(BaseModel):
    """One row in a search response. Carries metadata only; before / after
    JSON are not included in search results to keep the response small and
    so non-AP callers cannot indirectly read mutation deltas."""

    model_config = ConfigDict(from_attributes=True)

    entry_id: uuid.UUID
    actor_user_id: uuid.UUID
    actor_role: str
    endpoint: str
    http_method: str
    occurred_at: datetime
    outcome: str
    resource_type: str
    resource_id: uuid.UUID | None
    ip_address: str | None
    user_agent: str | None


class AuditSearchResponse(BaseModel):
    """Wrapped list response. Mirrors the slice 3 list response convention
    (TierConfigList, ThresholdRegisterList) plus pagination cursor and
    total_count for the unwrapped underlying query."""

    items: list[AuditSearchEntry]
    next_cursor: str | None = Field(
        default=None,
        description=(
            "Opaque cursor for the next page; null when no more results. "
            "Pass back as ?cursor=... to continue."
        ),
    )
    total_count: int = Field(
        description="Total rows matching the filters (unrelated to page size)."
    )
    page_size: int


class AuditEntryDiff(BaseModel):
    """Shallow top-level diff between before_json and after_json.

    Slice 5c implementation: top-level keys only. Deep diff (nested object
    paths, array index alignment) is a future enhancement. Each section
    is keyed by the field name; values mirror the original JSON shape.
    """

    added: dict[str, Any] = Field(
        default_factory=dict,
        description="Keys present in after_json but not in before_json.",
    )
    removed: dict[str, Any] = Field(
        default_factory=dict,
        description="Keys present in before_json but not in after_json.",
    )
    changed: dict[str, dict[str, Any]] = Field(
        default_factory=dict,
        description=(
            "Keys present in both with different values. "
            "Each entry is {'before': <prior>, 'after': <new>}."
        ),
    )


class AuditEntryDetail(BaseModel):
    """Full audit entry including before / after JSON and server-computed diff.

    Returned by GET /api/v1/audit/entry/{entry_id}. The endpoint is gated
    on AP=true regardless of role (require_audit_access strict_ap=True).
    diff is null when either before_json or after_json is null.
    """

    model_config = ConfigDict(from_attributes=True)

    entry_id: uuid.UUID
    occurred_at: datetime
    actor_user_id: uuid.UUID
    actor_role: str
    http_method: str
    endpoint: str
    resource_type: str
    resource_id: uuid.UUID | None
    outcome: str
    ip_address: str | None
    before_json: dict[str, Any] | None
    after_json: dict[str, Any] | None
    diff: AuditEntryDiff | None
