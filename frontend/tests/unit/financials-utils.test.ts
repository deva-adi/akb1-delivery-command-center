/**
 * Unit tests for lib/financials.ts utility functions.
 *
 * Covers: isFinancialsAllowed, FINANCIALS_ALLOWED_ROLES, ragToFinancialState,
 * buildFinancialsWhat, buildProgrammeFinancialStates.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  isFinancialsAllowed,
  FINANCIALS_ALLOWED_ROLES,
  ragToFinancialState,
  buildFinancialsWhat,
  buildProgrammeFinancialStates,
} from "@/lib/financials";
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
  status: MilestoneItem["status"] = "On Track",
  code = "PEGASUS",
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
// isFinancialsAllowed
// ---------------------------------------------------------------------------

describe("isFinancialsAllowed", () => {
  it("allows PortfolioOwner", () => {
    expect(isFinancialsAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isFinancialsAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows FinanceLead", () => {
    expect(isFinancialsAllowed("FinanceLead")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isFinancialsAllowed("ReadOnly")).toBe(true);
  });

  it("blocks DeliveryDirector", () => {
    expect(isFinancialsAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isFinancialsAllowed("HRBusinessPartner")).toBe(false);
  });

  it("FINANCIALS_ALLOWED_ROLES has exactly 4 entries", () => {
    expect(FINANCIALS_ALLOWED_ROLES.size).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// ragToFinancialState
// ---------------------------------------------------------------------------

describe("ragToFinancialState", () => {
  it("Failing maps to BREACH", () => {
    expect(ragToFinancialState("Failing")).toBe("BREACH");
  });

  it("Red maps to RED", () => {
    expect(ragToFinancialState("Red")).toBe("RED");
  });

  it("Amber maps to AMBER", () => {
    expect(ragToFinancialState("Amber")).toBe("AMBER");
  });

  it("Watching maps to AMBER", () => {
    expect(ragToFinancialState("Watching")).toBe("AMBER");
  });

  it("Green maps to GREEN", () => {
    expect(ragToFinancialState("Green")).toBe("GREEN");
  });

  it("null maps to GREEN", () => {
    expect(ragToFinancialState(null)).toBe("GREEN");
  });

  it("undefined maps to GREEN", () => {
    expect(ragToFinancialState(undefined)).toBe("GREEN");
  });
});

// ---------------------------------------------------------------------------
// buildFinancialsWhat
// ---------------------------------------------------------------------------

describe("buildFinancialsWhat", () => {
  it("returns zero counts for empty inputs", () => {
    const result = buildFinancialsWhat({}, []);
    expect(result.atRiskProgrammes).toBe(0);
    expect(result.visibleProgrammes).toBe(0);
    expect(result.delayedMilestones).toBe(0);
    expect(result.worstProgramme).toBeNull();
  });

  it("counts Red as at-risk", () => {
    const health = { PEGASUS: [makeSnapshot("PEGASUS", "Red")] };
    expect(buildFinancialsWhat(health, []).atRiskProgrammes).toBe(1);
  });

  it("counts Failing as at-risk", () => {
    const health = { ANDROMEDA: [makeSnapshot("ANDROMEDA", "Failing")] };
    expect(buildFinancialsWhat(health, []).atRiskProgrammes).toBe(1);
  });

  it("does not count Amber as at-risk", () => {
    const health = { PHOENIX: [makeSnapshot("PHOENIX", "Amber")] };
    expect(buildFinancialsWhat(health, []).atRiskProgrammes).toBe(0);
  });

  it("counts Delayed milestones correctly", () => {
    const milestones = [
      makeMilestone("Delayed"),
      makeMilestone("Delayed"),
      makeMilestone("On Track"),
    ];
    expect(buildFinancialsWhat({}, milestones).delayedMilestones).toBe(2);
  });

  it("worstProgramme is Failing over Red", () => {
    const health = {
      PEGASUS: [makeSnapshot("PEGASUS", "Red")],
      ANDROMEDA: [makeSnapshot("ANDROMEDA", "Failing")],
    };
    expect(buildFinancialsWhat(health, []).worstProgramme).toBe("ANDROMEDA");
  });

  it("worstProgramme is null when all Green", () => {
    const health = {
      ORION: [makeSnapshot("ORION", "Green")],
      HELIX: [makeSnapshot("HELIX", "Green")],
    };
    expect(buildFinancialsWhat(health, []).worstProgramme).toBeNull();
  });

  it("uses most recent snapshot for risk classification", () => {
    const health = {
      PEGASUS: [
        makeSnapshot("PEGASUS", "Red", "2026-01-01"),
        makeSnapshot("PEGASUS", "Green", "2026-04-01"),
      ],
    };
    expect(buildFinancialsWhat(health, []).atRiskProgrammes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildProgrammeFinancialStates
// ---------------------------------------------------------------------------

describe("buildProgrammeFinancialStates", () => {
  it("returns empty array for empty input", () => {
    expect(buildProgrammeFinancialStates({})).toHaveLength(0);
  });

  it("returns one state per programme", () => {
    const health = {
      PEGASUS: [makeSnapshot("PEGASUS", "Red")],
      ORION: [makeSnapshot("ORION", "Green")],
    };
    expect(buildProgrammeFinancialStates(health)).toHaveLength(2);
  });

  it("Failing maps to BREACH state", () => {
    const health = { ANDROMEDA: [makeSnapshot("ANDROMEDA", "Failing")] };
    const states = buildProgrammeFinancialStates(health);
    expect(states).toHaveLength(1);
    expect(states[0]!.state).toBe("BREACH");
  });

  it("Green maps to GREEN state", () => {
    const health = { HELIX: [makeSnapshot("HELIX", "Green")] };
    const states = buildProgrammeFinancialStates(health);
    expect(states[0]!.state).toBe("GREEN");
  });

  it("uses most recent snapshot", () => {
    const health = {
      PEGASUS: [
        makeSnapshot("PEGASUS", "Red", "2026-01-01"),
        makeSnapshot("PEGASUS", "Green", "2026-04-01"),
      ],
    };
    const states = buildProgrammeFinancialStates(health);
    expect(states[0]!.state).toBe("GREEN");
  });

  it("no snapshots defaults to GREEN", () => {
    const health = { VEGA: [] };
    const states = buildProgrammeFinancialStates(health);
    expect(states[0]!.state).toBe("GREEN");
  });
});
