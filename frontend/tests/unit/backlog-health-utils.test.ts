/**
 * Unit tests for lib/backlog-health.ts utility functions.
 *
 * Covers: isBacklogHealthAllowed, BACKLOG_HEALTH_ALLOWED_ROLES,
 * ragToBacklogState, buildBacklogProxy, buildBacklogWhat.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  isBacklogHealthAllowed,
  BACKLOG_HEALTH_ALLOWED_ROLES,
  ragToBacklogState,
  buildBacklogProxy,
  buildBacklogWhat,
} from "@/lib/backlog-health";
import type { HealthSnapshotItem, MilestoneItem } from "@/lib/delivery-health";

function makeSnapshot(
  code: string,
  overallRag: HealthSnapshotItem["overall_rag"],
  date = "2026-04-01",
): HealthSnapshotItem {
  return {
    snapshot_id: "00000000-0000-0000-0000-000000000001",
    programme_code: code,
    snapshot_date: date,
    overall_rag: overallRag,
    schedule_rag: null,
    budget_rag: null,
    resources_rag: null,
    risks_rag: null,
    commentary: null,
    captured_by_user_id: "00000000-0000-0000-0000-000000000099",
    created_at: "2026-04-01T00:00:00Z",
  };
}

function makeMilestone(
  code: string,
  status: MilestoneItem["status"],
): MilestoneItem {
  return {
    milestone_id: "00000000-0000-0000-0000-000000000001",
    programme_code: code,
    title: "Test milestone",
    baseline_date: null,
    due_date: "2026-06-01",
    status,
    completion_pct: 50,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isBacklogHealthAllowed
// ---------------------------------------------------------------------------

describe("isBacklogHealthAllowed", () => {
  it("allows PortfolioOwner", () => {
    expect(isBacklogHealthAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isBacklogHealthAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isBacklogHealthAllowed("ReadOnly")).toBe(true);
  });

  it("blocks FinanceLead", () => {
    expect(isBacklogHealthAllowed("FinanceLead")).toBe(false);
  });

  it("blocks DeliveryDirector", () => {
    expect(isBacklogHealthAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isBacklogHealthAllowed("HRBusinessPartner")).toBe(false);
  });

  it("BACKLOG_HEALTH_ALLOWED_ROLES has exactly 3 entries", () => {
    expect(BACKLOG_HEALTH_ALLOWED_ROLES.size).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// ragToBacklogState
// ---------------------------------------------------------------------------

describe("ragToBacklogState", () => {
  it("Failing maps to CRITICAL", () => {
    expect(ragToBacklogState("Failing")).toBe("CRITICAL");
  });

  it("Red maps to RED", () => {
    expect(ragToBacklogState("Red")).toBe("RED");
  });

  it("Watching maps to AMBER", () => {
    expect(ragToBacklogState("Watching")).toBe("AMBER");
  });

  it("Amber maps to AMBER", () => {
    expect(ragToBacklogState("Amber")).toBe("AMBER");
  });

  it("Green maps to GREEN", () => {
    expect(ragToBacklogState("Green")).toBe("GREEN");
  });

  it("null maps to GREEN", () => {
    expect(ragToBacklogState(null)).toBe("GREEN");
  });
});

// ---------------------------------------------------------------------------
// buildBacklogProxy
// ---------------------------------------------------------------------------

describe("buildBacklogProxy", () => {
  it("Failing programme gets CRITICAL state", () => {
    const snaps = new Map([["PEGASUS", [makeSnapshot("PEGASUS", "Failing")]]]);
    const miles = new Map<string, MilestoneItem[]>();
    const result = buildBacklogProxy(snaps, miles);
    const row = result.find((r) => r.code === "PEGASUS");
    expect(row?.state).toBe("CRITICAL");
  });

  it("delayedCount counts Delayed milestones per programme", () => {
    const snaps = new Map<string, HealthSnapshotItem[]>();
    const miles = new Map([
      ["ORION", [makeMilestone("ORION", "Delayed"), makeMilestone("ORION", "Delayed")]],
    ]);
    const result = buildBacklogProxy(snaps, miles);
    const row = result.find((r) => r.code === "ORION");
    expect(row?.delayedCount).toBe(2);
  });

  it("atRiskCount counts At Risk milestones per programme", () => {
    const snaps = new Map<string, HealthSnapshotItem[]>();
    const miles = new Map([
      ["HELIX", [makeMilestone("HELIX", "At Risk"), makeMilestone("HELIX", "On Track")]],
    ]);
    const result = buildBacklogProxy(snaps, miles);
    const row = result.find((r) => r.code === "HELIX");
    expect(row?.atRiskCount).toBe(1);
  });

  it("empty milestone map returns zero counts", () => {
    const snaps = new Map<string, HealthSnapshotItem[]>();
    const miles = new Map<string, MilestoneItem[]>();
    const result = buildBacklogProxy(snaps, miles);
    expect(result.every((r) => r.delayedCount === 0 && r.atRiskCount === 0)).toBe(true);
  });

  it("returns 10 rows in seed order", () => {
    const snaps = new Map<string, HealthSnapshotItem[]>();
    const miles = new Map<string, MilestoneItem[]>();
    const result = buildBacklogProxy(snaps, miles);
    expect(result).toHaveLength(10);
    expect(result[0]!.code).toBe("PEGASUS");
  });

  it("uses the most recent snapshot when multiple exist", () => {
    const snaps = new Map([
      [
        "ATLAS",
        [
          makeSnapshot("ATLAS", "Failing", "2026-01-01"),
          makeSnapshot("ATLAS", "Green", "2026-04-01"),
        ],
      ],
    ]);
    const miles = new Map<string, MilestoneItem[]>();
    const result = buildBacklogProxy(snaps, miles);
    const row = result.find((r) => r.code === "ATLAS");
    expect(row?.state).toBe("GREEN");
  });
});

// ---------------------------------------------------------------------------
// buildBacklogWhat
// ---------------------------------------------------------------------------

describe("buildBacklogWhat", () => {
  it("pressureProgrammes counts programmes where delayedCount > 0", () => {
    const states = [
      { code: "PEGASUS", state: "CRITICAL" as const, rag: "Failing" as const, delayedCount: 2, atRiskCount: 0 },
      { code: "ORION", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 1 },
    ];
    expect(buildBacklogWhat(states).pressureProgrammes).toBe(1);
  });

  it("delayedTotal sums correctly across all programmes", () => {
    const states = [
      { code: "PEGASUS", state: "CRITICAL" as const, rag: "Failing" as const, delayedCount: 3, atRiskCount: 0 },
      { code: "HELIX", state: "AMBER" as const, rag: "Amber" as const, delayedCount: 2, atRiskCount: 1 },
    ];
    expect(buildBacklogWhat(states).delayedTotal).toBe(5);
  });

  it("worstProgramme returns CRITICAL over RED regardless of array order", () => {
    const states = [
      { code: "HELIX", state: "RED" as const, rag: "Red" as const, delayedCount: 1, atRiskCount: 0 },
      { code: "PEGASUS", state: "CRITICAL" as const, rag: "Failing" as const, delayedCount: 2, atRiskCount: 0 },
    ];
    expect(buildBacklogWhat(states).worstProgramme).toBe("PEGASUS");
  });

  it("worstProgramme returns first RED when no CRITICAL", () => {
    const states = [
      { code: "ORION", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 0 },
      { code: "ATLAS", state: "RED" as const, rag: "Red" as const, delayedCount: 1, atRiskCount: 0 },
    ];
    expect(buildBacklogWhat(states).worstProgramme).toBe("ATLAS");
  });

  it("worstProgramme is null when all GREEN", () => {
    const states = [
      { code: "VEGA", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 0 },
      { code: "DRACO", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 0 },
    ];
    expect(buildBacklogWhat(states).worstProgramme).toBeNull();
  });

  it("returns zero counts for empty states", () => {
    const result = buildBacklogWhat([]);
    expect(result.pressureProgrammes).toBe(0);
    expect(result.delayedTotal).toBe(0);
    expect(result.atRiskTotal).toBe(0);
    expect(result.visibleProgrammes).toBe(0);
    expect(result.worstProgramme).toBeNull();
  });

  it("visibleProgrammes matches states array length", () => {
    const states = [
      { code: "PEGASUS", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 0 },
      { code: "ORION", state: "GREEN" as const, rag: "Green" as const, delayedCount: 0, atRiskCount: 0 },
    ];
    expect(buildBacklogWhat(states).visibleProgrammes).toBe(2);
  });
});
