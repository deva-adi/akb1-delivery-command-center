"""rev 4 foundation: programmes, people, audit_trail_entries, escalation_tier_config

First migration of the M6 backend build. Covers the four entities the slice 1
PATCH /admin/tier-config endpoint exercises end-to-end. Schema follows Data
Model PRD rev 4 sections 4.2 (people rev 3 expansion), 4.71 (audit_trail
_entries) and 4.73 (escalation_tier_config); programmes is the rev 2
baseline. Append-only invariant on audit_trail_entries enforced at three
layers per D-036:

  Layer 1: REVOKE UPDATE and DELETE from PUBLIC and from akb1_owner.
  Layer 2: ENABLE plus FORCE ROW LEVEL SECURITY so even the table owner
           cannot bypass via ownership.
  Layer 3: explicit INSERT and SELECT policies; no UPDATE policy, no DELETE
           policy, so RLS implicitly denies both.

Revision ID: 001_rev4_foundation
Revises: None (first migration)
Create Date: 2026-04-25
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "001_rev4_foundation"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


APP_ROLE = "akb1_app"
OWNER_ROLE = "akb1_owner"


def upgrade() -> None:
    # ------------------------------------------------------------------
    # programmes (rev 2 baseline; rev 3 business_case_outcome_expected
    # column lands in a later migration alongside the rev 3 entity batch)
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE programmes (
            programme_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            programme_code VARCHAR(32) UNIQUE NOT NULL,
            name VARCHAR(128) NOT NULL,
            client_id UUID NULL,
            dm_user_id UUID NULL,
            health_state VARCHAR(16) NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    op.execute("CREATE INDEX programmes_code_idx ON programmes (programme_code)")

    # ------------------------------------------------------------------
    # people (rev 2 baseline plus rev 3 fields per section 4.2)
    # ap_flag column is the per-Q3 ruling Audit Permission flag.
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE people (
            person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(128) UNIQUE NOT NULL,
            full_name VARCHAR(128) NOT NULL,
            role VARCHAR(32) NOT NULL,
            ap_flag BOOLEAN NOT NULL DEFAULT FALSE,
            band VARCHAR(8) NULL,
            programme_id UUID NULL,
            overtime_hours_mtd NUMERIC(5,2) NULL,
            last_1on1_sentiment_score SMALLINT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT people_role_enum CHECK (
                role IN (
                    'PortfolioOwner','DeliveryDirector','ProgrammeManager',
                    'FinanceLead','HRBusinessPartner','ReadOnly'
                )
            ),
            CONSTRAINT people_last_1on1_sentiment_score_range CHECK (
                last_1on1_sentiment_score IS NULL
                OR (last_1on1_sentiment_score BETWEEN 0 AND 100)
            )
        )
        """
    )
    op.execute("CREATE INDEX people_role_idx ON people (role)")
    op.execute("CREATE INDEX people_programme_id_idx ON people (programme_id)")

    # Cross-FKs between programmes and people, applied after both tables exist
    op.execute(
        """
        ALTER TABLE programmes
            ADD CONSTRAINT programmes_dm_user_id_fkey
            FOREIGN KEY (dm_user_id) REFERENCES people(person_id) ON DELETE SET NULL
        """
    )
    op.execute(
        """
        ALTER TABLE people
            ADD CONSTRAINT people_programme_id_fkey
            FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE SET NULL
        """
    )

    # ------------------------------------------------------------------
    # escalation_tier_config per section 4.73 (added per Q1 ruling)
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE escalation_tier_config (
            tier_number SMALLINT PRIMARY KEY,
            default_label VARCHAR(64) NOT NULL,
            display_label VARCHAR(64) NOT NULL,
            description_text TEXT NULL,
            sla_hint_hours SMALLINT NULL,
            role_mapping JSONB NOT NULL,
            active BOOLEAN NOT NULL DEFAULT TRUE,
            last_edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_edited_by_user_id UUID NOT NULL
                REFERENCES people(person_id) ON DELETE RESTRICT,
            CONSTRAINT escalation_tier_config_tier_number_range
                CHECK (tier_number BETWEEN 1 AND 9)
        )
        """
    )

    # ------------------------------------------------------------------
    # audit_trail_entries per section 4.71 with append-only enforcement
    # ------------------------------------------------------------------
    op.execute(
        """
        CREATE TABLE audit_trail_entries (
            entry_id UUID PRIMARY KEY,
            actor_user_id UUID NOT NULL
                REFERENCES people(person_id) ON DELETE RESTRICT,
            actor_role VARCHAR(64) NOT NULL,
            endpoint VARCHAR(256) NOT NULL,
            http_method VARCHAR(8) NOT NULL,
            occurred_at TIMESTAMPTZ NOT NULL,
            outcome VARCHAR(16) NOT NULL,
            resource_type VARCHAR(64) NOT NULL,
            resource_id UUID NULL,
            before_json JSONB NULL,
            after_json JSONB NULL,
            ip_address VARCHAR(64) NULL,
            user_agent VARCHAR(256) NULL,
            session_id VARCHAR(64) NULL,
            CONSTRAINT audit_trail_entries_method_enum
                CHECK (http_method IN ('POST','PUT','PATCH','DELETE')),
            CONSTRAINT audit_trail_entries_outcome_enum
                CHECK (outcome IN ('Success','Denied','Error'))
        )
        """
    )
    op.execute(
        "CREATE INDEX audit_trail_entries_occurred_at_idx "
        "ON audit_trail_entries (occurred_at DESC)"
    )
    op.execute(
        "CREATE INDEX audit_trail_entries_actor_idx "
        "ON audit_trail_entries (actor_user_id, occurred_at DESC)"
    )
    op.execute(
        "CREATE INDEX audit_trail_entries_resource_idx "
        "ON audit_trail_entries (resource_type, resource_id, occurred_at DESC)"
    )

    # ------------------------------------------------------------------
    # Per-table grants for the application role.
    # akb1_owner is the schema and table owner; UPDATE and DELETE on
    # audit_trail_entries are explicitly REVOKED so FORCE RLS plus
    # privilege REVOKE form a defense-in-depth.
    # escalation_tier_config has no DELETE grant: tiers are deactivated
    # via active = false rather than deleted (preserves FK history).
    # ------------------------------------------------------------------
    op.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON programmes TO {APP_ROLE}")
    op.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON people TO {APP_ROLE}")
    op.execute(f"GRANT SELECT, INSERT, UPDATE ON escalation_tier_config TO {APP_ROLE}")

    # ------------------------------------------------------------------
    # audit_trail_entries append-only enforcement
    # REVOKE ALL strips owner-default privileges (UPDATE, DELETE, TRUNCATE,
    # TRIGGER). Only SELECT and INSERT are re-granted. TRUNCATE bypasses RLS
    # in Postgres so removing it explicitly is necessary for defense in
    # depth. The owner can still ALTER TABLE to disable RLS; that is an
    # operational constraint covered by holding akb1_owner credentials only
    # for migrations and never granting them to the application path.
    # ------------------------------------------------------------------
    op.execute("REVOKE ALL ON audit_trail_entries FROM PUBLIC")
    op.execute(f"REVOKE ALL ON audit_trail_entries FROM {APP_ROLE}")
    op.execute(f"REVOKE ALL ON audit_trail_entries FROM {OWNER_ROLE}")
    op.execute(f"GRANT SELECT, INSERT ON audit_trail_entries TO {APP_ROLE}")
    op.execute(f"GRANT SELECT, INSERT ON audit_trail_entries TO {OWNER_ROLE}")
    op.execute("ALTER TABLE audit_trail_entries ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE audit_trail_entries FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY audit_trail_insert ON audit_trail_entries "
        "FOR INSERT WITH CHECK (true)"
    )
    op.execute(
        "CREATE POLICY audit_trail_select ON audit_trail_entries "
        "FOR SELECT USING (true)"
    )


def downgrade() -> None:
    # Drop policies and RLS first so DROP TABLE does not stumble on dependents.
    op.execute("DROP POLICY IF EXISTS audit_trail_select ON audit_trail_entries")
    op.execute("DROP POLICY IF EXISTS audit_trail_insert ON audit_trail_entries")
    op.execute("ALTER TABLE IF EXISTS audit_trail_entries NO FORCE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE IF EXISTS audit_trail_entries DISABLE ROW LEVEL SECURITY")
    op.execute("DROP INDEX IF EXISTS audit_trail_entries_resource_idx")
    op.execute("DROP INDEX IF EXISTS audit_trail_entries_actor_idx")
    op.execute("DROP INDEX IF EXISTS audit_trail_entries_occurred_at_idx")
    op.execute("DROP TABLE IF EXISTS audit_trail_entries")
    op.execute("DROP TABLE IF EXISTS escalation_tier_config")
    op.execute(
        "ALTER TABLE IF EXISTS people DROP CONSTRAINT IF EXISTS people_programme_id_fkey"
    )
    op.execute(
        "ALTER TABLE IF EXISTS programmes DROP CONSTRAINT IF EXISTS programmes_dm_user_id_fkey"
    )
    op.execute("DROP INDEX IF EXISTS people_programme_id_idx")
    op.execute("DROP INDEX IF EXISTS people_role_idx")
    op.execute("DROP TABLE IF EXISTS people")
    op.execute("DROP INDEX IF EXISTS programmes_code_idx")
    op.execute("DROP TABLE IF EXISTS programmes")
