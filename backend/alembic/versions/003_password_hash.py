"""password_hash column on people table

Slice 3 adds POST /api/v1/auth/login. The login service compares a posted
password against people.password_hash via bcrypt. Schema change is
additive: NOT NULL with empty-string default so the migration is safe
against any existing rows; the seed fills the column with a precomputed
bcrypt hash for the canonical demo password.

Revision ID: 003_password_hash
Revises: 002_threshold_register
Create Date: 2026-04-25
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "003_password_hash"
down_revision: str | None = "002_threshold_register"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE people ADD COLUMN password_hash VARCHAR(128) NOT NULL DEFAULT ''"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE people DROP COLUMN IF EXISTS password_hash")
