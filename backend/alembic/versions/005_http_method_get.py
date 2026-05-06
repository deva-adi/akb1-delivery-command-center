"""audit_trail_entries.http_method CHECK enum: + GET

Slice 4 needs to audit denials on the GET /api/v1/audit/search endpoint
(per kickoff: "DD/AP=false 403 ... emits ApFlagDenied audit row"). The
slice 1 schema per Data Model PRD section 4.71 restricted http_method to
{POST, PUT, PATCH, DELETE} on the rationale "read endpoints not audited
at this volume". That rationale covered successful reads; denials on
read endpoints are sparse and must be audited per the AP-flag governance
contract. Documenting this divergence from PRD section 4.71 in D-040;
PRD rev 5 cascade should fold the change in.

Downgrade is reversible only if no rows carry http_method='GET'. Operator
must clean up first; the downgrade itself does not delete audit rows
because the append-only invariant from slice 2.3 REVOKEs DELETE.

Revision ID: 005_http_method_get
Revises: 004_outcome_enum_extension
Create Date: 2026-04-25
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "005_http_method_get"
down_revision: str | None = "004_outcome_enum_extension"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE audit_trail_entries "
        "DROP CONSTRAINT IF EXISTS audit_trail_entries_method_enum"
    )
    op.execute(
        "ALTER TABLE audit_trail_entries "
        "ADD CONSTRAINT audit_trail_entries_method_enum "
        "CHECK (http_method IN ('GET','POST','PUT','PATCH','DELETE'))"
    )


def downgrade() -> None:
    # Forward-only enum: the restrictive POST/PUT/PATCH/DELETE constraint
    # cannot be restored if any audit_trail_entries row carries
    # http_method='GET' (DELETE on the table is REVOKE'd per the slice 2.3
    # append-only invariant; we cannot purge offending rows). A full
    # downgrade chain to slice 1 still works because 001_rev4_foundation
    # downgrade does DROP TABLE audit_trail_entries which removes the data
    # and the constraint together. Per-step downgrade -1 from 005 leaves
    # the GET-allowing constraint in place; this is intentional and
    # documented in D-040.
    pass
