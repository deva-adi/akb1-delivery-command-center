"""audit_trail_entries.outcome CHECK enum: + ApFlagDenied, RoleDenied

Per D-038 decision 10 carried forward through D-039 forward-looking note,
the AP-gated endpoints in slice 4 onward distinguish two denial classes:

  - RoleDenied   : caller's role is not in the allowed set for the endpoint
  - ApFlagDenied : caller has the role but lacks the Audit Permission flag

Both write an audit row at the moment of the 403 response so denials are
queryable by AP observers. Existing values (Success, Denied, Error) are
preserved.

Downgrade is reversible only if no rows carry the new outcome values.
Operator must clean up first (DELETE WHERE outcome IN ('ApFlagDenied',
'RoleDenied')); the downgrade itself does NOT delete audit rows because
the append-only invariant from slice 2.3 REVOKEs DELETE on the table.

Revision ID: 004_outcome_enum_extension
Revises: 003_password_hash
Create Date: 2026-04-25
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "004_outcome_enum_extension"
down_revision: str | None = "003_password_hash"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE audit_trail_entries "
        "DROP CONSTRAINT IF EXISTS audit_trail_entries_outcome_enum"
    )
    op.execute(
        "ALTER TABLE audit_trail_entries "
        "ADD CONSTRAINT audit_trail_entries_outcome_enum "
        "CHECK (outcome IN ('Success','Denied','Error','ApFlagDenied','RoleDenied'))"
    )


def downgrade() -> None:
    # Forward-only enum (same pattern as 005_http_method_get): the
    # restrictive Success/Denied/Error constraint cannot be restored if
    # any audit_trail_entries row carries the new ApFlagDenied or
    # RoleDenied outcomes, because DELETE on the table is REVOKE'd per
    # the slice 2.3 append-only invariant. The full downgrade chain still
    # works because 001_rev4_foundation downgrade drops the table.
    # Per-step downgrade -1 from 004 leaves the extended constraint in
    # place; documented in D-040.
    pass
