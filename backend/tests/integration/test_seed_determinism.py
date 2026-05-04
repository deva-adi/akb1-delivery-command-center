"""Seed byte-identicality and row-shape gate.

Slice 2.4 north star: two runs of `seed` against an Alembic-reset schema
must produce a byte-identical SHA-256 fingerprint. If this drifts,
non-determinism leaked in (system clock, uuid.uuid4, un-seeded random).

Also asserts row counts and the locked programme name list per the
slice 2.4 conversation.
"""

from __future__ import annotations

import asyncio

import asyncpg
import pytest

from app.seed.generator import (
    PROGRAMMES,
    SEED,
    compute_seed_hash,
    seed,
)
from tests.integration._helpers import OWNER_DSN, reset_schema_via_alembic


pytestmark = pytest.mark.integration


def test_seed_constant_locked() -> None:
    """The kickoff and PRDs all reference SEED=20260424. Hard guard."""
    assert SEED == 20260424


async def test_seed_byte_identical_across_runs() -> None:
    """Two runs of seed against an Alembic-reset schema must hash equal.

    Self-contained: handles its own schema resets so it does not depend on
    or interfere with the session-scoped seeded fixture. Leaves the schema
    in a seeded state at end (which the session fixture would simply
    re-establish if any subsequent test needs it).
    """
    await asyncio.to_thread(reset_schema_via_alembic)
    conn = await asyncpg.connect(OWNER_DSN)
    try:
        await seed(conn)
        digest_a = await compute_seed_hash(conn)
    finally:
        await conn.close()

    await asyncio.to_thread(reset_schema_via_alembic)
    conn = await asyncpg.connect(OWNER_DSN)
    try:
        await seed(conn)
        digest_b = await compute_seed_hash(conn)
    finally:
        await conn.close()

    assert digest_a == digest_b, (
        f"seed determinism drifted: {digest_a} vs {digest_b}. "
        f"Suspect timestamp, uuid4, or un-seeded RNG."
    )
    assert len(digest_a) == 64  # SHA-256 hex


async def test_seed_row_counts(owner_seeded: asyncpg.Connection) -> None:
    counts = {
        "programmes": await owner_seeded.fetchval("SELECT COUNT(*) FROM programmes"),
        "people": await owner_seeded.fetchval("SELECT COUNT(*) FROM people"),
        "escalation_tier_config": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM escalation_tier_config"
        ),
        "threshold_calibration_register": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM threshold_calibration_register"
        ),
        "audit_trail_entries": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM audit_trail_entries"
        ),
        "person_programme_assignments": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM person_programme_assignments"
        ),
        "programme_raids": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM programme_raids"
        ),
        "programme_milestones": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM programme_milestones"
        ),
        "programme_health_snapshots": await owner_seeded.fetchval(
            "SELECT COUNT(*) FROM programme_health_snapshots"
        ),
    }
    assert counts["programmes"] == 10
    assert counts["people"] == 300
    assert counts["escalation_tier_config"] == 5
    assert counts["threshold_calibration_register"] == 60
    assert counts["audit_trail_entries"] == 0
    assert counts["person_programme_assignments"] == 25
    assert counts["programme_raids"] == 150
    assert counts["programme_milestones"] == 200
    assert counts["programme_health_snapshots"] == 40


async def test_seed_programme_names_locked(owner_seeded: asyncpg.Connection) -> None:
    rows = await owner_seeded.fetch(
        "SELECT programme_code FROM programmes ORDER BY programme_code"
    )
    actual = [r["programme_code"] for r in rows]
    expected = sorted([code for code, _, _ in PROGRAMMES])
    assert actual == expected
    assert actual == [
        "ANDROMEDA", "ATLAS", "DRACO", "HELIX", "LYRA",
        "ORION", "PEGASUS", "PHOENIX", "STELLAR", "VEGA",
    ]


async def test_seed_health_state_distribution(owner_seeded: asyncpg.Connection) -> None:
    """The health_state mix lines up with Data Model rev 4 section 5.1.4
    EVM seed targets (2 Failing-equivalent, 3 Slipping, 5 Healthy/Watching)."""
    rows = await owner_seeded.fetch(
        "SELECT health_state, COUNT(*) AS n FROM programmes GROUP BY health_state"
    )
    counts = {r["health_state"]: r["n"] for r in rows}

    assert counts.get("Failing", 0) == 1   # ANDROMEDA
    assert counts.get("Red", 0) == 1       # PEGASUS
    assert counts.get("Amber", 0) == 3     # PHOENIX, STELLAR, HELIX
    assert counts.get("Watching", 0) == 1  # ATLAS
    assert counts.get("Green", 0) == 4     # ORION, DRACO, LYRA, VEGA


async def test_seed_role_distribution(owner_seeded: asyncpg.Connection) -> None:
    rows = await owner_seeded.fetch(
        "SELECT role, COUNT(*) AS n FROM people GROUP BY role"
    )
    counts = {r["role"]: r["n"] for r in rows}

    assert counts["PortfolioOwner"] == 1
    assert counts["DeliveryDirector"] == 2
    assert counts["ProgrammeManager"] == 10
    assert counts["FinanceLead"] == 3
    assert counts["HRBusinessPartner"] == 2
    assert counts["ReadOnly"] == 282
    assert sum(counts.values()) == 300


async def test_seed_band_distribution(owner_seeded: asyncpg.Connection) -> None:
    rows = await owner_seeded.fetch(
        "SELECT band, COUNT(*) AS n FROM people GROUP BY band"
    )
    counts = {r["band"]: r["n"] for r in rows}

    assert counts["B1"] == 90
    assert counts["B2"] == 90
    assert counts["B3"] == 60
    assert counts["B4"] == 36
    assert counts["B5"] == 24


async def test_seed_ap_flag_assignment(owner_seeded: asyncpg.Connection) -> None:
    """Per Q3 plus slice 2.4 tweak: AP true on 1 PO + 1 DD + 1 FL = 3 holders."""
    n_ap_total = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM people WHERE ap_flag = TRUE"
    )
    assert n_ap_total == 3

    rows = await owner_seeded.fetch(
        "SELECT role, COUNT(*) AS n FROM people WHERE ap_flag = TRUE GROUP BY role"
    )
    counts = {r["role"]: r["n"] for r in rows}
    assert counts == {"PortfolioOwner": 1, "DeliveryDirector": 1, "FinanceLead": 1}


async def test_seed_tier_configs_locked(owner_seeded: asyncpg.Connection) -> None:
    """Q1 ruling: 5 tiers DM, Programme Director, Portfolio Owner, Sponsor,
    Steerco. display_label seeded equal to default_label so the slice 2.5
    rename test has a known starting point."""
    rows = await owner_seeded.fetch(
        "SELECT tier_number, default_label, display_label, active "
        "FROM escalation_tier_config ORDER BY tier_number"
    )
    assert len(rows) == 5
    assert [r["default_label"] for r in rows] == [
        "DM", "Programme Director", "Portfolio Owner", "Sponsor", "Steerco",
    ]
    assert all(r["display_label"] == r["default_label"] for r in rows)
    assert all(r["active"] is True for r in rows)


async def test_seed_threshold_register_completeness(
    owner_seeded: asyncpg.Connection,
) -> None:
    rows = await owner_seeded.fetch(
        "SELECT metric_id, direction, green_threshold, amber_threshold, "
        "red_threshold, rationale_text, owning_role "
        "FROM threshold_calibration_register"
    )
    assert len(rows) == 60

    valid_directions = {"HigherIsBetter", "LowerIsBetter", "RangeIsBetter"}
    valid_owners = {"PortfolioOwner", "FinanceLead", "ProgrammeManager"}

    for r in rows:
        assert r["direction"] in valid_directions, r["metric_id"]
        assert r["owning_role"] in valid_owners, r["metric_id"]
        assert r["green_threshold"] is not None, r["metric_id"]
        assert r["amber_threshold"] is not None, r["metric_id"]
        assert r["red_threshold"] is not None, r["metric_id"]
        assert r["rationale_text"], r["metric_id"]


async def test_seed_threshold_register_cluster_counts(
    owner_seeded: asyncpg.Connection,
) -> None:
    """Section 5.2 totals: 8 + 10 + 10 + 8 + 6 + 8 + 6 + 4 = 60.
    Three RangeIsBetter metrics: tcpi, rate_card_drift_pct,
    audit_trail_write_events_per_day."""
    n_total = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM threshold_calibration_register"
    )
    assert n_total == 60

    n_range = await owner_seeded.fetchval(
        "SELECT COUNT(*) FROM threshold_calibration_register "
        "WHERE direction = 'RangeIsBetter'"
    )
    assert n_range == 3
