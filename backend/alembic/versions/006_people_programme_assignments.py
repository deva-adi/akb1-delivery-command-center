"""person_programme_assignments join table (slice 5a)

Backs the DD/FL programme-scoped visibility filter on GET /api/v1/audit/search.
The slice 4 implementation deferred programme scoping (D-040 ruling 2)
because no people-to-programmes mapping existed beyond the PM-only
people.programme_id column. Slice 5a closes that TODO with this join
table.

Schema per Adi's slice 5a kickoff:

  person_id     UUID NOT NULL FK people(person_id)            ON DELETE CASCADE
  programme_id  TEXT NOT NULL FK programmes(programme_code)   ON DELETE CASCADE
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  PRIMARY KEY (person_id, programme_id)
  INDEX (person_id)

Two naming notes (flagged for review at PRD rev 5 cascade):
  1. The PK column on people is person_id, not id. Kickoff said
     people(id) which is conversational shorthand.
  2. The FK target programmes(programme_code) is a UNIQUE VARCHAR(32)
     natural key, not the PK (which is programmes(programme_id) UUID).
     Postgres permits FK to UNIQUE columns. The new column is named
     programme_id but holds the TEXT code; the naming is inconsistent
     with the rest of the codebase (where programme_id always means
     the UUID). Preserved as kickoff specified; rename to programme_code
     during PRD rev 5 cascade if the inconsistency causes confusion.

Append-only by application convention only. No DB-level enforcement
(unlike audit_trail_entries which has FORCE RLS plus REVOKE UPDATE/DELETE).
Standard akb1_app grants on SELECT/INSERT/UPDATE/DELETE are applied.

Revision ID: 006_people_programme_assignments
Revises: 005_http_method_get
Create Date: 2026-04-30
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op


revision: str = "006_people_programme_assignments"
down_revision: str | None = "005_http_method_get"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


APP_ROLE = "akb1_app"


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE person_programme_assignments (
            person_id     UUID NOT NULL,
            programme_id  TEXT NOT NULL,
            assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (person_id, programme_id),
            FOREIGN KEY (person_id)
                REFERENCES people(person_id) ON DELETE CASCADE,
            FOREIGN KEY (programme_id)
                REFERENCES programmes(programme_code) ON DELETE CASCADE
        )
        """
    )
    op.execute(
        "CREATE INDEX person_programme_assignments_person_id_idx "
        "ON person_programme_assignments (person_id)"
    )
    op.execute(
        f"GRANT SELECT, INSERT, UPDATE, DELETE "
        f"ON person_programme_assignments TO {APP_ROLE}"
    )


def downgrade() -> None:
    op.execute(
        "DROP INDEX IF EXISTS person_programme_assignments_person_id_idx"
    )
    op.execute("DROP TABLE IF EXISTS person_programme_assignments")
