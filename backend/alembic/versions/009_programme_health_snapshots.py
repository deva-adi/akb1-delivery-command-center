"""programme_health_snapshots: weekly RAG snapshots per programme (slice M7-2)

Backs GET /api/v1/programmes/{code}/health and the 5a-broad audit search
extension. Converts the programmes.health_state point-in-time field into a
time series. One snapshot per programme per date enforced by UNIQUE
constraint. 40 seeded rows across 10 programmes (4 monthly snapshots each).

RAG values mirror the health_state enum already in use on programmes:
Red, Amber, Green, Watching, Failing.

Revision ID: 009_programme_health_snapshots
Revises: 008_programme_milestones
Create Date: 2026-05-03
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op


revision: str = "009_programme_health_snapshots"
down_revision: str | None = "008_programme_milestones"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

APP_ROLE = "akb1_app"

_RAG = "('Red', 'Amber', 'Green', 'Watching', 'Failing')"


def upgrade() -> None:
    op.execute(
        f"""
        CREATE TABLE programme_health_snapshots (
            snapshot_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            programme_code        VARCHAR(32) NOT NULL
                                  REFERENCES programmes(programme_code) ON DELETE CASCADE,
            snapshot_date         DATE NOT NULL,
            overall_rag           VARCHAR(16) NOT NULL,
            schedule_rag          VARCHAR(16) NULL,
            budget_rag            VARCHAR(16) NULL,
            resources_rag         VARCHAR(16) NULL,
            risks_rag             VARCHAR(16) NULL,
            commentary            TEXT NULL,
            captured_by_user_id   UUID NOT NULL
                                  REFERENCES people(person_id) ON DELETE RESTRICT,
            created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT programme_health_snapshots_overall_rag_enum
                CHECK (overall_rag IN {_RAG}),
            CONSTRAINT programme_health_snapshots_schedule_rag_enum
                CHECK (schedule_rag IS NULL OR schedule_rag IN {_RAG}),
            CONSTRAINT programme_health_snapshots_budget_rag_enum
                CHECK (budget_rag IS NULL OR budget_rag IN {_RAG}),
            CONSTRAINT programme_health_snapshots_resources_rag_enum
                CHECK (resources_rag IS NULL OR resources_rag IN {_RAG}),
            CONSTRAINT programme_health_snapshots_risks_rag_enum
                CHECK (risks_rag IS NULL OR risks_rag IN {_RAG}),
            UNIQUE (programme_code, snapshot_date)
        )
        """
    )
    op.execute(
        "CREATE INDEX programme_health_snapshots_programme_date_idx "
        "ON programme_health_snapshots (programme_code, snapshot_date DESC)"
    )
    op.execute(
        f"GRANT SELECT, INSERT, UPDATE, DELETE "
        f"ON programme_health_snapshots TO {APP_ROLE}"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS programme_health_snapshots_programme_date_idx")
    op.execute("DROP TABLE IF EXISTS programme_health_snapshots")
