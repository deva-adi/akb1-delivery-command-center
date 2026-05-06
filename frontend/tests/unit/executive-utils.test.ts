/**
 * Unit tests for lib/executive.ts utility functions.
 *
 * Covers: buildRaidSeverityIndex, buildProgrammeStateList,
 * buildExecutiveKPIs, executiveSubtitle.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry !
 * where a preceding toHaveLength guard proves existence.
 */

import { describe, it, expect } from "vitest";
import {
  buildRaidSeverityIndex,
  buildProgrammeStateList,
  buildExecutiveKPIs,
  executiveSubtitle,
} from "@/lib/executive";
import type { ProgrammeStateRow } from "@/lib/executive";
import type { RaidItem } from "@/lib/raids";
import type { MilestoneItem, HealthSnapshotItem } from "@/lib/delivery-health";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRaid(overrides: Partial<RaidItem> = {}): RaidItem {
  return {
    raid_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    raid_type: "Risk",
    title: "Test",
    description: null,
    severity: "High",
    status: "Open",
    owner_user_id: null,
    mitigation_date: null,
    raised_date: "2026-01-01",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeMilestone(overrides: Partial<MilestoneItem> = {}): MilestoneItem {
  return {
    milestone_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    title: "Test milestone",
    baseline_date: null,
    due_date: "2026-06-01",
    status: "On Track",
    completion_pct: 50,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeSnap(overrides: Partial<HealthSnapshotItem> = {}): HealthSnapshotItem {
  return {
    snapshot_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    snapshot_date: "2026-04-01",
    overall_rag: "Green",
    schedule_rag: null,
    budget_rag: null,
    resources_rag: null,
    risks_rag: null,
    commentary: null,
    captured_by_user_id: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-04-01T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildRaidSeverityIndex
// ---------------------------------------------------------------------------

describe("buildRaidSeverityIndex", () => {
  it("returns 0 for empty input", () => {
    expect(buildRaidSeverityIndex([])).toBe(0);
  });

  it("returns 10.0 when all open raids are Critical", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Open" }),
      makeRaid({ severity: "Critical", status: "Open" }),
    ];
    expect(buildRaidSeverityIndex(raids)).toBe(10.0);
  });

  it("returns 2.5 when all open raids are Low", () => {
    const raids = [
      makeRaid({ severity: "Low", status: "Open" }),
      makeRaid({ severity: "Low", status: "Open" }),
    ];
    expect(buildRaidSeverityIndex(raids)).toBe(2.5);
  });

  it("excludes Mitigated, Accepted, and Closed raids from index", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Mitigated" }),
      makeRaid({ severity: "Critical", status: "Closed" }),
      makeRaid({ severity: "Low", status: "Open" }),
    ];
    expect(buildRaidSeverityIndex(raids)).toBe(2.5);
  });

  it("includes Escalated raids", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Escalated" }),
    ];
    expect(buildRaidSeverityIndex(raids)).toBe(10.0);
  });
});

// ---------------------------------------------------------------------------
// buildProgrammeStateList
// ---------------------------------------------------------------------------

describe("buildProgrammeStateList", () => {
  it("returns one row per programme code", () => {
    const snaps = [
      makeSnap({ programme_code: "PEGASUS", overall_rag: "Green" }),
      makeSnap({ programme_code: "PHOENIX", overall_rag: "Red" }),
    ];
    expect(buildProgrammeStateList(snaps)).toHaveLength(2);
  });

  it("uses the most recent snapshot when programme has multiple", () => {
    const snaps = [
      makeSnap({ programme_code: "PEGASUS", overall_rag: "Green", snapshot_date: "2026-01-01" }),
      makeSnap({ programme_code: "PEGASUS", overall_rag: "Red", snapshot_date: "2026-04-01" }),
    ];
    const rows = buildProgrammeStateList(snaps);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.display).toBe("RED");
  });

  it("maps Failing overall_rag to BREACH display", () => {
    const snaps = [makeSnap({ overall_rag: "Failing" })];
    const rows = buildProgrammeStateList(snaps);
    expect(rows[0]!.display).toBe("BREACH");
  });

  it("maps Watching overall_rag to AMBER display", () => {
    const snaps = [makeSnap({ overall_rag: "Watching" })];
    const rows = buildProgrammeStateList(snaps);
    expect(rows[0]!.display).toBe("AMBER");
  });

  it("sorts BREACH before RED before AMBER before GREEN", () => {
    const snaps = [
      makeSnap({ programme_code: "A", overall_rag: "Green" }),
      makeSnap({ programme_code: "B", overall_rag: "Red" }),
      makeSnap({ programme_code: "C", overall_rag: "Failing" }),
      makeSnap({ programme_code: "D", overall_rag: "Amber" }),
    ];
    const rows = buildProgrammeStateList(snaps);
    const order = rows.map((r: ProgrammeStateRow) => r.display);
    expect(order).toEqual(["BREACH", "RED", "AMBER", "GREEN"]);
  });
});

// ---------------------------------------------------------------------------
// buildExecutiveKPIs
// ---------------------------------------------------------------------------

describe("buildExecutiveKPIs", () => {
  it("returns onTimePct 0 and raidSeverityIndex 0 for empty inputs", () => {
    const kpis = buildExecutiveKPIs([], []);
    expect(kpis.onTimePct).toBe(0);
    expect(kpis.raidSeverityIndex).toBe(0);
  });

  it("derives onTimePct from milestones", () => {
    const milestones = [
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "Delayed" }),
      makeMilestone({ status: "Delayed" }),
    ];
    const kpis = buildExecutiveKPIs(milestones, []);
    expect(kpis.onTimePct).toBe(50);
  });

  it("derives raidSeverityIndex from raids", () => {
    const raids = [makeRaid({ severity: "Critical", status: "Open" })];
    const kpis = buildExecutiveKPIs([], raids);
    expect(kpis.raidSeverityIndex).toBe(10.0);
  });

  it("counts unique programme codes across milestones and raids for visibleProgrammes", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS" }),
      makeMilestone({ programme_code: "PHOENIX" }),
    ];
    const raids = [makeRaid({ programme_code: "PHOENIX" })];
    const kpis = buildExecutiveKPIs(milestones, raids);
    expect(kpis.visibleProgrammes).toBe(2);
  });

  it("carries expected stub values", () => {
    const kpis = buildExecutiveKPIs([], []);
    expect(kpis.grossMarginPct).toBe(19.2);
    expect(kpis.netMarginPct).toBe(13.2);
    expect(kpis.utilisationPct).toBe(82.0);
    expect(kpis.decisionLatencyDays).toBe(9.3);
    expect(kpis.valueRealisationPct).toBe(54);
  });
});

// ---------------------------------------------------------------------------
// executiveSubtitle
// ---------------------------------------------------------------------------

describe("executiveSubtitle", () => {
  it("returns PO phrase for PortfolioOwner", () => {
    expect(executiveSubtitle("PortfolioOwner")).toBe("The director sees across.");
  });

  it("returns DD phrase for DeliveryDirector", () => {
    expect(executiveSubtitle("DeliveryDirector")).toBe(
      "The delivery manager walks each one.",
    );
  });

  it("returns null for ReadOnly", () => {
    expect(executiveSubtitle("ReadOnly")).toBeNull();
  });

  it("returns null for unknown role", () => {
    expect(executiveSubtitle("Unknown")).toBeNull();
  });
});
