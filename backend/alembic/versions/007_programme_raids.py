"""programme_raids: RAID items per programme (slice M7-2)

RAID taxonomy Risk/Assumption/Issue/Dependency is locked per D-013.
150 seeded rows across 10 programmes (15 per programme). Programme-scoped
via FK to programmes(programme_code). Backs GET /api/v1/programmes/{code}/raids
and the 5a-broad audit search extension.

Revision ID: 007_programme_raids
Revises: 006_people_programme_assignments
Create Date: 2026-05-03
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op


revision: str = "007_programme_raids"
down_revision: str | None = "006_people_programme_assignments"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

APP_ROLE = "akb1_app"


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE programme_raids (
            raid_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            programme_code  VARCHAR(32) NOT NULL
                            REFERENCES programmes(programme_code) ON DELETE CASCADE,
            raid_type       VARCHAR(16) NOT NULL,
            title           VARCHAR(256) NOT NULL,
            description     TEXT NULL,
            severity        VARCHAR(16) NOT NULL DEFAULT 'Medium',
            status          VARCHAR(32) NOT NULL DEFAULT 'Open',
            owner_user_id   UUID NULL
                            REFERENCES people(person_id) ON DELETE SET NULL,
            mitigation_date DATE NULL,
            raised_date     DATE NOT NULL,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT programme_raids_raid_type_enum
                CHECK (raid_type IN ('Risk', 'Assumption', 'Issue', 'Dependency')),
            CONSTRAINT programme_raids_severity_enum
                CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
            CONSTRAINT programme_raids_status_enum
                CHECK (status IN ('Open', 'Escalated', 'Mitigated', 'Accepted', 'Closed'))
        )
        """
    )
    op.execute(
        "CREATE INDEX programme_raids_programme_code_idx "
        "ON programme_raids (programme_code)"
    )
    op.execute(
        "CREATE INDEX programme_raids_programme_status_idx "
        "ON programme_raids (programme_code, status)"
    )
    op.execute(
        f"GRANT SELECT, INSERT, UPDATE, DELETE ON programme_raids TO {APP_ROLE}"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS programme_raids_programme_status_idx")
    op.execute("DROP INDEX IF EXISTS programme_raids_programme_code_idx")
    op.execute("DROP TABLE IF EXISTS programme_raids")
