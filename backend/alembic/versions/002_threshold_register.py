"""threshold_calibration_register table per Data Model PRD rev 4 section 4.31

Schema-only migration. The 60-metric seed payload from section 5.2 is
populated by backend/app/seed/generator.py at slice 2.4 acceptance time.

Revision ID: 002_threshold_register
Revises: 001_rev4_foundation
Create Date: 2026-04-25
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "002_threshold_register"
down_revision: str | None = "001_rev4_foundation"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


APP_ROLE = "akb1_app"


def upgrade() -> None:
    # ------------------------------------------------------------------
    # threshold_calibration_register per section 4.31. Replaces hardcoded
    # thresholds across the codebase. Read by every intelligence layer
    # rule before colour assignment. Seed payload follows section 5.2.
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE threshold_calibration_register (
            metric_id VARCHAR(64) PRIMARY KEY,
            display_name VARCHAR(128) NOT NULL,
            direction VARCHAR(16) NOT NULL,
            green_threshold NUMERIC(10,2) NOT NULL,
            amber_threshold NUMERIC(10,2) NOT NULL,
            red_threshold NUMERIC(10,2) NOT NULL,
            range_lower NUMERIC(10,2) NULL,
            range_upper NUMERIC(10,2) NULL,
            rationale_text TEXT NOT NULL,
            last_calibrated_at TIMESTAMPTZ NOT NULL,
            last_calibrated_by UUID NOT NULL
                REFERENCES people(person_id) ON DELETE RESTRICT,
            owning_role VARCHAR(32) NOT NULL,
            CONSTRAINT threshold_calibration_register_direction_enum
                CHECK (direction IN ('HigherIsBetter','LowerIsBetter','RangeIsBetter')),
            CONSTRAINT threshold_calibration_register_owning_role_enum
                CHECK (owning_role IN (
                    'PortfolioOwner','FinanceLead','ProgrammeManager'
                ))
        )
        """
    )
    op.execute(
        "CREATE INDEX threshold_calibration_register_owning_role_idx "
        "ON threshold_calibration_register (owning_role)"
    )

    # Per-table grants: app role gets full CRUD (PO/FL admin console will
    # PATCH the register; access enforced at the API layer per the rev 4
    # role matrix in 01_PRD_Data_Model.md section 3.1.10). Every edit
    # writes audit_trail_entries per Q4 Option A.
    op.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON threshold_calibration_register TO {APP_ROLE}")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS threshold_calibration_register_owning_role_idx")
    op.execute("DROP TABLE IF EXISTS threshold_calibration_register")
