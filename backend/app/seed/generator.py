"""Deterministic seed generator for the AKB1 Delivery Command Center demo.

Single entropy source: numpy.random.RandomState(SEED). Two runs against an
empty schema produce byte-identical row content; a SHA-256 fingerprint is
asserted by tests/integration/test_seed_determinism.py.

What gets seeded:
  - 300 people across pyramid bands B1 to B5 (90 / 90 / 60 / 36 / 24)
    with role distribution 1 PO, 2 DD, 10 PM, 3 FL, 2 HRBP, 282 RO
  - 10 programmes per the locked list (PEGASUS, PHOENIX, ORION, STELLAR,
    HELIX, ATLAS, DRACO, LYRA, VEGA, ANDROMEDA) and the health-state mix
    that lines up with Data Model rev 4 section 5.1.4 EVM seed targets
  - 5 escalation_tier_config rows (factory default labels per Q1 ruling)
  - 60 threshold_calibration_register rows transcribed from section 5.2
  - person_programme_assignments rows:
      slice 5a: each DD and each FL is assigned DD_FL_PROGRAMMES_EACH
        programmes drawn deterministically from the 10. Assignments may
        overlap across people. 15 rows total (2 DDs x 3 + 3 FLs x 3).
      slice M7-2: each PM is assigned their own programme (one entry per PM).
        10 rows. Closes the PM scope path for require_programme_access so
        DD/FL/PM all use the same two-level subquery on person_programme_assignments.
  - programme_raids: 15 RAID items per programme, 150 total (slice M7-2)
  - programme_milestones: 20 milestones per programme, 200 total (slice M7-2)
  - programme_health_snapshots: 4 monthly snapshots per programme, 40 total (slice M7-2)

audit_trail_entries is left empty; rows are written by mutating endpoints
in slice 2.5 onward.

CLI:
  cd backend
  PYTHONPATH=. .venv/bin/python -m app.seed.generator
"""

from __future__ import annotations

import asyncio
import datetime
import hashlib
import json
import uuid
from decimal import Decimal

import asyncpg
import numpy as np

from app.config import get_settings
from app.seed.data.threshold_register import THRESHOLD_REGISTER_SEED


SEED = 20260424

# Fixed timestamp anchors every created_at / updated_at / last_edited_at
# so two seed runs are byte-identical at the row level.
SEED_TIMESTAMP = datetime.datetime(2026, 4, 24, 0, 0, 0, tzinfo=datetime.timezone.utc)

# Precomputed bcrypt hash for the canonical demo password "akb1_demo_password"
# at cost factor 4. Embedded as a literal so the seed remains byte-identical
# across runs (bcrypt.gensalt is non-deterministic by design). All 300 seeded
# users share this hash. Production resets passwords during onboarding.
SEED_PASSWORD = "akb1_demo_password"
SEED_PASSWORD_HASH = "$2b$04$jGEwv4dPdI1uSWo/.1RhteSSxQkfXEATlZBS55BkfZ7W9kgsV0tQq"

# Admin bootstrap user. Inserted by seed_admin_user() AFTER seed() so the
# 300-user determinism hash and all row-count assertions remain unchanged.
# This account is NOT included in compute_seed_hash(). Do not add it to the
# 300-user loop; doing so would break the locked seed SHA-256.
ADMIN_USER_EMAIL = "adi.kompalli@akb1.demo"
ADMIN_USER_FULL_NAME = "Adi Kompalli"
ADMIN_USER_PASSWORD = "AKB1@Admin2026"
ADMIN_USER_PASSWORD_HASH = "$2b$04$rOSwW0VVJ4t0XVqWFKir.ODswomcCkEweli2uoAvFoh4tn5EHsP3q"


# ---------------------------------------------------------------------------
# Locked seed inputs (sourced from slice 2.4 conversation, see DECISION_LOG)
# ---------------------------------------------------------------------------

PROGRAMMES: list[tuple[str, str, str]] = [
    # (programme_code, name, health_state)
    ("PEGASUS",   "Pegasus",   "Red"),
    ("PHOENIX",   "Phoenix",   "Amber"),
    ("ORION",     "Orion",     "Green"),
    ("STELLAR",   "Stellar",   "Amber"),
    ("HELIX",     "Helix",     "Amber"),
    ("ATLAS",     "Atlas",     "Watching"),
    ("DRACO",     "Draco",     "Green"),
    ("LYRA",      "Lyra",      "Green"),
    ("VEGA",      "Vega",      "Green"),
    ("ANDROMEDA", "Andromeda", "Failing"),
]

# 20 first names from the AKB1 Hub voice samples (stable, well-known cohort)
FIRST_NAMES: list[str] = [
    "Rajiv", "Meera", "Priya", "Kiran", "Anand", "Nisha", "Vikram", "Deepa",
    "Ramesh", "Sumit", "Arun", "Ananya", "Sanjay", "Kavita", "Rohit", "Pooja",
    "Vivek", "Suchitra", "Aditi", "Naveen",
]

# 20 common Indian surnames (cycle pool)
LAST_NAMES: list[str] = [
    "Sharma", "Patel", "Iyer", "Reddy", "Kumar", "Singh", "Menon", "Nair",
    "Kapoor", "Gupta", "Joshi", "Desai", "Rao", "Verma", "Pillai", "Bose",
    "Chopra", "Malhotra", "Bhat", "Krishnan",
]

# Pyramid band distribution (sums to 300)
BAND_DIST: list[tuple[str, int]] = [
    ("B1", 90),
    ("B2", 90),
    ("B3", 60),
    ("B4", 36),
    ("B5", 24),
]

# Role distribution (sums to 300). RO is the application-access catch-all.
ROLE_DIST: list[tuple[str, int]] = [
    ("PortfolioOwner",      1),
    ("DeliveryDirector",    2),
    ("ProgrammeManager",   10),  # one per programme
    ("FinanceLead",         3),
    ("HRBusinessPartner",   2),
    ("ReadOnly",          282),
]

# Per Q3 ruling: AP flag is additive on PO, DD, FL only. Slice seed grants
# AP true on the first PO, the first DD, and the first FL so contract tests
# in slice 2.5 can exercise AP-flagged-non-PO and AP-flagged-FL paths.
AP_HOLDERS_PER_ROLE: dict[str, int] = {
    "PortfolioOwner":   1,
    "DeliveryDirector": 1,
    "FinanceLead":      1,
}

# Slice 5a: each DD and each FL is assigned this many programmes from the 10.
# Drawn deterministically via numpy.random.RandomState(SEED). Overlaps allowed
# across distinct people. Per-role count locked at 3 by Adi's slice 5a kickoff.
DD_FL_PROGRAMMES_EACH: int = 3

# 5 canonical escalation tiers per Q1 ruling. display_label seeds equal to
# default_label so the rename test in slice 2.5 has a known starting point.
TIER_CONFIGS: list[tuple[int, str, str, int, list[str]]] = [
    # (tier_number, default_label, description_text, sla_hint_hours, role_codes)
    (1, "DM",                "Delivery Manager tier (programme-level)",        24, ["DM"]),
    (2, "Programme Director","Programme Director tier",                        48, ["DD"]),
    (3, "Portfolio Owner",   "Portfolio Owner tier",                           72, ["PO"]),
    (4, "Sponsor",           "Executive Sponsor tier",                        120, ["Sponsor"]),
    (5, "Steerco",           "Steering Committee tier",                       168, ["Steerco"]),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _det_uuid(rng: np.random.RandomState) -> uuid.UUID:
    """Deterministic UUID drawn from the seeded RandomState.

    RandomState.bytes(16) returns exactly 16 bytes; bytes() over the result
    of randint(...) would inflate via the numpy buffer protocol to 128 bytes
    on a 64-bit dtype.
    """
    return uuid.UUID(bytes=rng.bytes(16))


def _expand_distribution(spec: list[tuple[str, int]]) -> list[str]:
    """Expand a [(value, count), ...] spec into a flat list."""
    out: list[str] = []
    for value, count in spec:
        out.extend([value] * count)
    return out


def _validate_seed_constant() -> None:
    """Belt-and-braces: the SEED constant in this module must equal the
    settings.seed value so the two never silently diverge."""
    settings_seed = get_settings().seed
    if settings_seed != SEED:
        raise RuntimeError(
            f"SEED constant drift: generator.py SEED={SEED} but "
            f"settings.seed={settings_seed}. Fix one or the other."
        )


# ---------------------------------------------------------------------------
# Seed payload
# ---------------------------------------------------------------------------

_SEED_TABLES = (
    "people",
    "programmes",
    "escalation_tier_config",
    "threshold_calibration_register",
    "person_programme_assignments",
    "programme_raids",
    "programme_milestones",
    "programme_health_snapshots",
)


async def seed(conn: asyncpg.Connection) -> None:
    """Seed the four target tables. Pure INSERT, assumes the schema is empty.

    Raises if any seed table already has rows. To re-run after a seed, the
    caller resets the schema via:

      alembic downgrade base && alembic upgrade head

    Rationale per D-037 candidate: slice 2.3 REVOKE's UPDATE on
    audit_trail_entries from akb1_owner. Postgres FK validation on a
    DELETE FROM people issues SELECT FOR KEY SHARE on the referencing
    table, which requires UPDATE privilege. The kickoff-locked invariant
    is preserved by keeping UPDATE REVOKE'd and resetting via Alembic
    instead of in-place DELETE.
    """
    _validate_seed_constant()

    counts: dict[str, int] = {}
    for table in _SEED_TABLES:
        n = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
        if n:
            counts[table] = n
    if counts:
        raise RuntimeError(
            "seed() expects an empty schema but found rows: "
            f"{counts}. Reset via "
            "'alembic downgrade base && alembic upgrade head' first."
        )

    rng = np.random.RandomState(SEED)

    # ----- People -----
    role_assignments = _expand_distribution(ROLE_DIST)
    band_assignments = _expand_distribution(BAND_DIST)
    assert len(role_assignments) == 300
    assert len(band_assignments) == 300

    ap_assigned: dict[str, int] = {role: 0 for role in AP_HOLDERS_PER_ROLE}
    people_rows: list[tuple] = []

    for i in range(300):
        person_id = _det_uuid(rng)
        role = role_assignments[i]
        band = band_assignments[i]
        first = FIRST_NAMES[i % len(FIRST_NAMES)]
        last = LAST_NAMES[(i // len(FIRST_NAMES)) % len(LAST_NAMES)]
        email = f"{first.lower()}.{last.lower()}{i:03d}@akb1.demo"
        full_name = f"{first} {last}"

        ap_flag = False
        if role in AP_HOLDERS_PER_ROLE and ap_assigned[role] < AP_HOLDERS_PER_ROLE[role]:
            ap_flag = True
            ap_assigned[role] += 1

        people_rows.append(
            (person_id, email, full_name, role, ap_flag, band,
             SEED_PASSWORD_HASH, SEED_TIMESTAMP)
        )

    await conn.executemany(
        """
        INSERT INTO people (
            person_id, email, full_name, role, ap_flag, band, password_hash,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        """,
        people_rows,
    )

    po_user_id = next(row[0] for row in people_rows if row[3] == "PortfolioOwner")
    pm_user_ids = [row[0] for row in people_rows if row[3] == "ProgrammeManager"]
    if len(pm_user_ids) != 10:
        raise RuntimeError(f"Expected 10 ProgrammeManager seeds, got {len(pm_user_ids)}")

    # ----- Programmes -----
    programmes_rows: list[tuple] = []
    programme_ids: list[uuid.UUID] = []
    for idx, (code, name, health) in enumerate(PROGRAMMES):
        prog_id = _det_uuid(rng)
        programme_ids.append(prog_id)
        dm_user_id = pm_user_ids[idx]
        programmes_rows.append((prog_id, code, name, dm_user_id, health, SEED_TIMESTAMP))

    await conn.executemany(
        """
        INSERT INTO programmes (
            programme_id, programme_code, name, dm_user_id, health_state,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $6)
        """,
        programmes_rows,
    )

    # Cross-link PMs back to their programme
    pm_links = [
        (pm_user_ids[i], programme_ids[i], SEED_TIMESTAMP) for i in range(10)
    ]
    await conn.executemany(
        "UPDATE people SET programme_id = $2, updated_at = $3 WHERE person_id = $1",
        pm_links,
    )

    # ----- Escalation tier config -----
    tier_rows: list[tuple] = []
    for tier_num, default_label, desc, sla_hint, role_codes in TIER_CONFIGS:
        role_mapping_json = json.dumps({"role_codes": role_codes}, sort_keys=True)
        tier_rows.append((
            tier_num, default_label, default_label, desc, sla_hint,
            role_mapping_json, True, SEED_TIMESTAMP, po_user_id,
        ))

    await conn.executemany(
        """
        INSERT INTO escalation_tier_config (
            tier_number, default_label, display_label, description_text,
            sla_hint_hours, role_mapping, active, last_edited_at,
            last_edited_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
        """,
        tier_rows,
    )

    # ----- Threshold calibration register -----
    threshold_rows: list[tuple] = []
    for (metric_id, display_name, direction, green, amber, red,
         range_lower, range_upper, rationale, owning_role) in THRESHOLD_REGISTER_SEED:
        threshold_rows.append((
            metric_id, display_name, direction,
            Decimal(str(green)), Decimal(str(amber)), Decimal(str(red)),
            Decimal(str(range_lower)) if range_lower is not None else None,
            Decimal(str(range_upper)) if range_upper is not None else None,
            rationale, SEED_TIMESTAMP, po_user_id, owning_role,
        ))

    await conn.executemany(
        """
        INSERT INTO threshold_calibration_register (
            metric_id, display_name, direction, green_threshold,
            amber_threshold, red_threshold, range_lower, range_upper,
            rationale_text, last_calibrated_at, last_calibrated_by, owning_role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """,
        threshold_rows,
    )

    # ----- person_programme_assignments (slice 5a) -----
    # Each DD and each FL is assigned DD_FL_PROGRAMMES_EACH programmes drawn
    # from the 10 via the same SEED-bound rng. Overlap across people is
    # allowed (two DDs may share a programme). Programme codes (TEXT) are
    # the FK target per the migration 006 schema decision.
    dd_user_ids = [row[0] for row in people_rows if row[3] == "DeliveryDirector"]
    fl_user_ids = [row[0] for row in people_rows if row[3] == "FinanceLead"]
    programme_codes = [code for code, _, _ in PROGRAMMES]

    assignment_rows: list[tuple] = []
    for person_id in dd_user_ids + fl_user_ids:
        # numpy.random.choice(replace=False) picks distinct programmes for
        # this person; deterministic given the rng's current state.
        chosen_idx = rng.choice(
            len(programme_codes),
            size=DD_FL_PROGRAMMES_EACH,
            replace=False,
        )
        for i in chosen_idx:
            assignment_rows.append(
                (person_id, programme_codes[int(i)], SEED_TIMESTAMP)
            )

    await conn.executemany(
        """
        INSERT INTO person_programme_assignments (
            person_id, programme_id, assigned_at
        ) VALUES ($1, $2, $3)
        """,
        assignment_rows,
    )

    # ----- PM programme assignments (slice M7-2) -----
    # Each PM is assigned their own programme so DD/FL/PM all use the same
    # person_programme_assignments subquery in require_programme_access.
    # programme_codes_list[i] corresponds to pm_user_ids[i] per the
    # programmes seeding order above.
    programme_codes_list = [code for code, _, _ in PROGRAMMES]
    pm_assignment_rows: list[tuple] = []
    for i in range(10):
        pm_assignment_rows.append(
            (pm_user_ids[i], programme_codes_list[i], SEED_TIMESTAMP)
        )

    await conn.executemany(
        """
        INSERT INTO person_programme_assignments (
            person_id, programme_id, assigned_at
        ) VALUES ($1, $2, $3)
        """,
        pm_assignment_rows,
    )

    # ----- programme_raids (slice M7-2) -----
    # 15 RAIDs per programme, 150 total. Type cycles through the four RAID
    # types deterministically; severity and status are drawn from the seeded
    # rng so the distribution is reproducible without further state.
    _RAID_TYPES = ["Risk", "Risk", "Risk", "Risk", "Risk",
                   "Assumption", "Assumption", "Assumption", "Assumption",
                   "Issue", "Issue", "Issue", "Issue",
                   "Dependency", "Dependency"]
    _SEVERITIES = ["Critical", "High", "Medium", "Low"]
    _OPEN_STATUSES = ["Open", "Escalated"]
    _CLOSED_STATUSES = ["Mitigated", "Accepted", "Closed"]

    raid_rows: list[tuple] = []
    for prog_idx, (code, _, health) in enumerate(PROGRAMMES):
        owner_id = pm_user_ids[prog_idx]
        for j in range(15):
            raid_id = _det_uuid(rng)
            raid_type = _RAID_TYPES[j]
            sev_idx = int(rng.randint(0, 4))
            severity = _SEVERITIES[sev_idx]
            if health in ("Red", "Failing"):
                open_prob = 0.7
            elif health in ("Amber", "Watching"):
                open_prob = 0.5
            else:
                open_prob = 0.3
            if rng.random() < open_prob:
                status = _OPEN_STATUSES[int(rng.randint(0, 2))]
                mitigation_date = None
            else:
                status = _CLOSED_STATUSES[int(rng.randint(0, 3))]
                mitigation_date = (
                    SEED_TIMESTAMP.date()
                    - datetime.timedelta(days=int(rng.randint(1, 30)))
                )
            raised_date = (
                SEED_TIMESTAMP.date()
                - datetime.timedelta(days=int(rng.randint(14, 180)))
            )
            title = f"{code} {raid_type} {j + 1:02d}"
            raid_rows.append(
                (raid_id, code, raid_type, title, None, severity, status,
                 owner_id, mitigation_date, raised_date, SEED_TIMESTAMP)
            )

    await conn.executemany(
        """
        INSERT INTO programme_raids (
            raid_id, programme_code, raid_type, title, description,
            severity, status, owner_user_id, mitigation_date, raised_date,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        """,
        raid_rows,
    )

    # ----- programme_milestones (slice M7-2) -----
    # 20 milestones per programme, 200 total. Due dates spread across 12
    # months before and after SEED_TIMESTAMP. Status reflects programme health.
    _MS_STATUSES_HEALTHY = ["On Track", "On Track", "On Track", "Complete", "At Risk"]
    _MS_STATUSES_AT_RISK = ["On Track", "At Risk", "At Risk", "Delayed", "Complete"]
    _MS_STATUSES_FAILING = ["At Risk", "Delayed", "Delayed", "Delayed", "On Track"]

    milestone_rows: list[tuple] = []
    for prog_idx, (code, _, health) in enumerate(PROGRAMMES):
        if health in ("Red", "Failing"):
            pool = _MS_STATUSES_FAILING
        elif health in ("Amber", "Watching"):
            pool = _MS_STATUSES_AT_RISK
        else:
            pool = _MS_STATUSES_HEALTHY

        for j in range(20):
            milestone_id = _det_uuid(rng)
            days_offset = int(rng.randint(-90, 270))
            due_date = SEED_TIMESTAMP.date() + datetime.timedelta(days=days_offset)
            baseline_date = due_date - datetime.timedelta(days=int(rng.randint(0, 21)))
            status = pool[j % len(pool)]
            if status == "Complete":
                completion_pct = 100
            elif status == "Delayed":
                completion_pct = int(rng.randint(20, 70))
            elif status == "At Risk":
                completion_pct = int(rng.randint(30, 80))
            else:
                elapsed = max(0, (SEED_TIMESTAMP.date() - baseline_date).days)
                total = max(1, (due_date - baseline_date).days)
                completion_pct = min(95, int(elapsed / total * 100))
            title = f"{code} Milestone {j + 1:02d}"
            milestone_rows.append(
                (milestone_id, code, title, baseline_date, due_date,
                 status, completion_pct, SEED_TIMESTAMP)
            )

    await conn.executemany(
        """
        INSERT INTO programme_milestones (
            milestone_id, programme_code, title, baseline_date, due_date,
            status, completion_pct, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        """,
        milestone_rows,
    )

    # ----- programme_health_snapshots (slice M7-2) -----
    # 4 monthly snapshots per programme, 40 total. Snapshots are anchored at
    # months -3, -2, -1, 0 relative to SEED_TIMESTAMP. overall_rag matches
    # the programme's current health_state; sub-RAGs are drawn from the rng.
    _RAG_VALUES = ["Red", "Amber", "Green", "Watching", "Failing"]

    snapshot_rows: list[tuple] = []
    for prog_idx, (code, _, health) in enumerate(PROGRAMMES):
        overall_rag = health
        for month_offset in range(3, -1, -1):
            snapshot_id = _det_uuid(rng)
            snapshot_date = (
                SEED_TIMESTAMP.date().replace(day=1)
                - datetime.timedelta(days=month_offset * 30)
            )
            sub_rag = _RAG_VALUES[int(rng.randint(0, len(_RAG_VALUES)))]
            commentary = f"Monthly health snapshot for {code}, period {4 - month_offset} of 4."
            snapshot_rows.append(
                (snapshot_id, code, snapshot_date, overall_rag,
                 sub_rag, sub_rag, sub_rag, sub_rag,
                 commentary, po_user_id, SEED_TIMESTAMP)
            )

    await conn.executemany(
        """
        INSERT INTO programme_health_snapshots (
            snapshot_id, programme_code, snapshot_date, overall_rag,
            schedule_rag, budget_rag, resources_rag, risks_rag,
            commentary, captured_by_user_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        """,
        snapshot_rows,
    )


async def compute_seed_hash(conn: asyncpg.Connection) -> str:
    """SHA-256 of the deterministic seed footprint.

    Dumps the four seed tables in PK order, formats each row as canonical
    JSON (sorted keys, ISO timestamps, UUID and Decimal as strings) and
    concatenates with newline separators before hashing. Two byte-identical
    seed runs produce identical hashes.
    """
    h = hashlib.sha256()

    queries = [
        ("programmes",
         "SELECT programme_id, programme_code, name, dm_user_id, health_state, "
         "start_date, end_date, created_at, updated_at "
         "FROM programmes ORDER BY programme_code"),
        ("people",
         "SELECT person_id, email, full_name, role, ap_flag, band, programme_id, "
         "password_hash, overtime_hours_mtd, last_1on1_sentiment_score, "
         "created_at, updated_at "
         "FROM people ORDER BY email"),
        ("escalation_tier_config",
         "SELECT tier_number, default_label, display_label, description_text, "
         "sla_hint_hours, role_mapping, active, last_edited_at, last_edited_by_user_id "
         "FROM escalation_tier_config ORDER BY tier_number"),
        ("threshold_calibration_register",
         "SELECT metric_id, display_name, direction, green_threshold, amber_threshold, "
         "red_threshold, range_lower, range_upper, rationale_text, last_calibrated_at, "
         "last_calibrated_by, owning_role "
         "FROM threshold_calibration_register ORDER BY metric_id"),
        ("person_programme_assignments",
         "SELECT person_id, programme_id, assigned_at "
         "FROM person_programme_assignments ORDER BY person_id, programme_id"),
        ("programme_raids",
         "SELECT raid_id, programme_code, raid_type, title, description, "
         "severity, status, owner_user_id, mitigation_date, raised_date, "
         "created_at, updated_at "
         "FROM programme_raids ORDER BY programme_code, raid_id"),
        ("programme_milestones",
         "SELECT milestone_id, programme_code, title, baseline_date, due_date, "
         "status, completion_pct, created_at, updated_at "
         "FROM programme_milestones ORDER BY programme_code, milestone_id"),
        ("programme_health_snapshots",
         "SELECT snapshot_id, programme_code, snapshot_date, overall_rag, "
         "schedule_rag, budget_rag, resources_rag, risks_rag, commentary, "
         "captured_by_user_id, created_at "
         "FROM programme_health_snapshots ORDER BY programme_code, snapshot_date"),
    ]

    for table_name, query in queries:
        h.update(f"### {table_name}\n".encode("utf-8"))
        rows = await conn.fetch(query)
        for r in rows:
            row_dict: dict = {}
            for k, v in r.items():
                if isinstance(v, uuid.UUID):
                    row_dict[k] = f"uuid:{v}"
                elif isinstance(v, datetime.datetime):
                    row_dict[k] = f"ts:{v.isoformat()}"
                elif isinstance(v, datetime.date):
                    row_dict[k] = f"date:{v.isoformat()}"
                elif isinstance(v, Decimal):
                    row_dict[k] = f"dec:{v}"
                else:
                    row_dict[k] = v
            h.update(json.dumps(row_dict, sort_keys=True).encode("utf-8"))
            h.update(b"\n")

    return h.hexdigest()


async def seed_admin_user(conn: asyncpg.Connection) -> None:
    """Insert the canonical admin bootstrap user.

    Called by main() after seed(). Kept separate so compute_seed_hash()
    and the 300-user determinism test are not affected. Safe to call on an
    already-seeded schema; skips the insert if the email already exists.
    """
    existing = await conn.fetchval(
        "SELECT person_id FROM people WHERE email = $1",
        ADMIN_USER_EMAIL,
    )
    if existing:
        return

    admin_id = uuid.uuid5(uuid.NAMESPACE_DNS, ADMIN_USER_EMAIL)
    await conn.execute(
        """
        INSERT INTO people (
            person_id, email, full_name, role, ap_flag, band,
            password_hash, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        """,
        admin_id,
        ADMIN_USER_EMAIL,
        ADMIN_USER_FULL_NAME,
        "PortfolioOwner",
        True,
        "B5",
        ADMIN_USER_PASSWORD_HASH,
        SEED_TIMESTAMP,
    )


async def main() -> None:
    """CLI entry: seed against the configured migration DSN.

    Assumes the schema is empty. To re-run after a previous seed, reset
    via `alembic downgrade base && alembic upgrade head` first.
    """
    settings = get_settings()
    # asyncpg wants the bare postgres scheme without the +asyncpg suffix
    dsn = settings.database_url_migrations.replace("+asyncpg", "")
    conn = await asyncpg.connect(dsn)
    try:
        await seed(conn)
        await seed_admin_user(conn)
        digest = await compute_seed_hash(conn)
        counts = {
            "programmes": await conn.fetchval("SELECT COUNT(*) FROM programmes"),
            "people": await conn.fetchval("SELECT COUNT(*) FROM people"),
            "escalation_tier_config": await conn.fetchval(
                "SELECT COUNT(*) FROM escalation_tier_config"
            ),
            "threshold_calibration_register": await conn.fetchval(
                "SELECT COUNT(*) FROM threshold_calibration_register"
            ),
            "audit_trail_entries": await conn.fetchval(
                "SELECT COUNT(*) FROM audit_trail_entries"
            ),
            "person_programme_assignments": await conn.fetchval(
                "SELECT COUNT(*) FROM person_programme_assignments"
            ),
            "programme_raids": await conn.fetchval(
                "SELECT COUNT(*) FROM programme_raids"
            ),
            "programme_milestones": await conn.fetchval(
                "SELECT COUNT(*) FROM programme_milestones"
            ),
            "programme_health_snapshots": await conn.fetchval(
                "SELECT COUNT(*) FROM programme_health_snapshots"
            ),
        }
        print(f"Seed complete. SHA-256: {digest}")
        for table, n in counts.items():
            print(f"  {table:35s} {n}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
