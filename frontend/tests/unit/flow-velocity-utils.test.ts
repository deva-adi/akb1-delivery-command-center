/**
 * Unit tests for lib/flow-velocity.ts utility functions.
 *
 * Covers: isFlowAllowed, FLOW_ALLOWED_ROLES, WIP_LIMITS, buildFlowKPIs,
 * buildFlowWhat, buildSprintWindowTable.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  isFlowAllowed,
  FLOW_ALLOWED_ROLES,
  WIP_LIMITS,
  buildFlowKPIs,
  buildFlowWhat,
  buildSprintWindowTable,
} from "@/lib/flow-velocity";
import type { MilestoneItem } from "@/lib/delivery-health";

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

// ---------------------------------------------------------------------------
// isFlowAllowed
// ---------------------------------------------------------------------------

describe("isFlowAllowed", () => {
  it("returns true for PortfolioOwner", () => {
    expect(isFlowAllowed("PortfolioOwner")).toBe(true);
  });

  it("returns true for DeliveryDirector", () => {
    expect(isFlowAllowed("DeliveryDirector")).toBe(true);
  });

  it("returns true for ProgrammeManager", () => {
    expect(isFlowAllowed("ProgrammeManager")).toBe(true);
  });

  it("returns true for ReadOnly", () => {
    expect(isFlowAllowed("ReadOnly")).toBe(true);
  });

  it("returns false for FinanceLead", () => {
    expect(isFlowAllowed("FinanceLead")).toBe(false);
  });

  it("returns false for HRBusinessPartner", () => {
    expect(isFlowAllowed("HRBusinessPartner")).toBe(false);
  });

  it("FLOW_ALLOWED_ROLES has exactly 4 entries", () => {
    expect(FLOW_ALLOWED_ROLES.size).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// WIP_LIMITS
// ---------------------------------------------------------------------------

describe("WIP_LIMITS", () => {
  it("has exactly 10 programme entries", () => {
    expect(Object.keys(WIP_LIMITS)).toHaveLength(10);
  });

  it("PEGASUS limit is 20", () => {
    expect(WIP_LIMITS["PEGASUS"]).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// buildFlowKPIs
// ---------------------------------------------------------------------------

describe("buildFlowKPIs", () => {
  it("returns zeros and stubs when no milestones", () => {
    const kpis = buildFlowKPIs([]);
    expect(kpis.throughputProxy).toBe(0);
    expect(kpis.wipBreachCount).toBe(0);
    expect(kpis.visibleProgrammes).toBe(0);
    expect(kpis.cycleTimeDaysStub).toBe(8.2);
    expect(kpis.flowEfficiencyPctStub).toBe(42);
    expect(kpis.leadTimeP85DaysStub).toBe(18.6);
  });

  it("throughputProxy is count of Complete milestones", () => {
    const milestones = [
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "At Risk" }),
    ];
    expect(buildFlowKPIs(milestones).throughputProxy).toBe(2);
  });

  it("visibleProgrammes counts distinct programme_code values", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS" }),
      makeMilestone({ programme_code: "PEGASUS" }),
      makeMilestone({ programme_code: "PHOENIX" }),
    ];
    expect(buildFlowKPIs(milestones).visibleProgrammes).toBe(2);
  });

  it("wipBreachCount reflects programmes where WIP proxy exceeds limit", () => {
    // ANDROMEDA limit is 8. Seeding 10 On Track milestones exceeds it.
    const milestones = Array.from({ length: 10 }, () =>
      makeMilestone({ programme_code: "ANDROMEDA", status: "On Track" }),
    );
    expect(buildFlowKPIs(milestones).wipBreachCount).toBe(1);
  });

  it("stub values are returned regardless of milestone data", () => {
    const milestones = [makeMilestone()];
    const kpis = buildFlowKPIs(milestones);
    expect(kpis.cycleTimeDaysStub).toBe(8.2);
    expect(kpis.flowEfficiencyPctStub).toBe(42);
    expect(kpis.leadTimeP85DaysStub).toBe(18.6);
  });
});

// ---------------------------------------------------------------------------
// buildFlowWhat
// ---------------------------------------------------------------------------

describe("buildFlowWhat", () => {
  it("returns null worstProgramme when no milestones", () => {
    const result = buildFlowWhat([]);
    expect(result.worstProgramme).toBeNull();
    expect(result.wipBreachCount).toBe(0);
  });

  it("derives throughputProxy from Complete count", () => {
    const milestones = [
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "On Track" }),
    ];
    expect(buildFlowWhat(milestones).throughputProxy).toBe(1);
  });

  it("derives wipBreachCount correctly", () => {
    const milestones = Array.from({ length: 9 }, () =>
      makeMilestone({ programme_code: "ANDROMEDA", status: "On Track" }),
    );
    expect(buildFlowWhat(milestones).wipBreachCount).toBe(1);
  });

  it("worstProgramme is null when no breaches", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "On Track" }),
    ];
    expect(buildFlowWhat(milestones).worstProgramme).toBeNull();
  });

  it("worstProgramme is identified when breach exists", () => {
    const milestones = [
      ...Array.from({ length: 10 }, () =>
        makeMilestone({ programme_code: "ANDROMEDA", status: "On Track" }),
      ),
    ];
    const result = buildFlowWhat(milestones);
    expect(result.worstProgramme).toBe("ANDROMEDA");
  });
});

// ---------------------------------------------------------------------------
// buildSprintWindowTable
// ---------------------------------------------------------------------------

describe("buildSprintWindowTable", () => {
  it("returns empty array when no milestones", () => {
    expect(buildSprintWindowTable([])).toHaveLength(0);
  });

  it("groups milestones by programme", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "Complete", due_date: "2026-02-01" }),
      makeMilestone({ programme_code: "PHOENIX", status: "Complete", due_date: "2026-03-01" }),
    ];
    const rows = buildSprintWindowTable(milestones);
    expect(rows).toHaveLength(2);
    const codes = rows.map((r) => r.programmeCode);
    expect(codes).toContain("PEGASUS");
    expect(codes).toContain("PHOENIX");
  });

  it("trend is up when window3 > window1 (3 distinct months)", () => {
    const milestones = [
      makeMilestone({ status: "Complete", due_date: "2026-01-10" }),
      makeMilestone({ status: "Complete", due_date: "2026-02-10" }),
      makeMilestone({ status: "Complete", due_date: "2026-04-10" }),
      makeMilestone({ status: "Complete", due_date: "2026-04-11" }),
    ];
    const rows = buildSprintWindowTable(milestones);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.trend).toBe("up");
  });

  it("trend is down when window3 < window1 (3 distinct months)", () => {
    const milestones = [
      makeMilestone({ status: "Complete", due_date: "2026-01-10" }),
      makeMilestone({ status: "Complete", due_date: "2026-01-11" }),
      makeMilestone({ status: "Complete", due_date: "2026-02-10" }),
      makeMilestone({ status: "Complete", due_date: "2026-04-10" }),
    ];
    const rows = buildSprintWindowTable(milestones);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.trend).toBe("down");
  });
});
