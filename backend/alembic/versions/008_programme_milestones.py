"""programme_milestones: milestone schedule per programme (slice M7-2)

Backs GET /api/v1/programmes/{code}/milestones and the 5a-broad audit
search extension. Corresponds to the 'deliverables' entity in Data Model
PRD rev 2 section 3; renamed programme_milestones for clarity. 200 seeded
rows across 10 programmes (20 per programme).

Revision ID: 008_programme_milestones
Revises: 007_programme_raids
Create Date: 2026-05-03
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op


revision: str = "008_programme_milestones"
down_revision: str | None = "007_programme_raids"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

APP_ROLE = "akb1_app"


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE programme_milestones (
            milestone_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            programme_code  VARCHAR(32) NOT NULL
                            REFERENCES programmes(programme_code) ON DELETE CASCADE,
            title           VARCHAR(256) NOT NULL,
            baseline_date   DATE NULL,
            due_date        DATE NOT NULL,
            status          VARCHAR(32) NOT NULL DEFAULT 'On Track',
            completion_pct  SMALLINT NOT NULL DEFAULT 0,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT programme_milestones_status_enum
                CHECK (status IN ('On Track', 'At Risk', 'Delayed', 'Complete')),
            CONSTRAINT programme_milestones_completion_pct_range
                CHECK (completion_pct BETWEEN 0 AND 100)
        )
        """
    )
    op.execute(
        "CREATE INDEX programme_milestones_programme_code_idx "
        "ON programme_milestones (programme_code)"
    )
    op.execute(
        f"GRANT SELECT, INSERT, UPDATE, DELETE ON programme_milestones TO {APP_ROLE}"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS programme_milestones_programme_code_idx")
    op.execute("DROP TABLE IF EXISTS programme_milestones")
