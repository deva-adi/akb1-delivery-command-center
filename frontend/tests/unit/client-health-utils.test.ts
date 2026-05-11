/**
 * Unit tests for lib/client-health.ts utility functions.
 *
 * Covers: isClientHealthAllowed, CLIENT_HEALTH_ALLOWED_ROLES,
 * buildClientHealthProxy, buildClientHealthWhat, RAG_WEIGHT.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  isClientHealthAllowed,
  CLIENT_HEALTH_ALLOWED_ROLES,
  buildClientHealthProxy,
  buildClientHealthWhat,
  RAG_WEIGHT,
} from "@/lib/client-health";
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
// isClientHealthAllowed
// ---------------------------------------------------------------------------

describe("isClientHealthAllowed", () => {
  it("allows PortfolioOwner", () => {
    expect(isClientHealthAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isClientHealthAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows FinanceLead", () => {
    expect(isClientHealthAllowed("FinanceLead")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isClientHealthAllowed("ReadOnly")).toBe(true);
  });

  it("blocks DeliveryDirector", () => {
    expect(isClientHealthAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isClientHealthAllowed("HRBusinessPartner")).toBe(false);
  });

  it("CLIENT_HEALTH_ALLOWED_ROLES has exactly 4 entries", () => {
    expect(CLIENT_HEALTH_ALLOWED_ROLES.size).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// RAG_WEIGHT map completeness
// ---------------------------------------------------------------------------

describe("RAG_WEIGHT", () => {
  it("contains all 5 RAG status keys", () => {
    const keys = Object.keys(RAG_WEIGHT);
    expect(keys).toContain("Failing");
    expect(keys).toContain("Red");
    expect(keys).toContain("Watching");
    expect(keys).toContain("Amber");
    expect(keys).toContain("Green");
    expect(keys).toHaveLength(5);
  });

  it("Failing has lower weight than Green", () => {
    expect(RAG_WEIGHT["Failing"]).toBeLessThan(RAG_WEIGHT["Green"]);
  });
});

// ---------------------------------------------------------------------------
// buildClientHealthProxy
// ---------------------------------------------------------------------------

describe("buildClientHealthProxy", () => {
  it("Failing maps to INTERVENE", () => {
    const map = new Map([["PEGASUS", [makeSnapshot("PEGASUS", "Failing")]]]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "PEGASUS");
    expect(row?.state).toBe("INTERVENE");
  });

  it("Red maps to INTERVENE", () => {
    const map = new Map([["PEGASUS", [makeSnapshot("PEGASUS", "Red")]]]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "PEGASUS");
    expect(row?.state).toBe("INTERVENE");
  });

  it("Watching maps to WATCH", () => {
    const map = new Map([["ORION", [makeSnapshot("ORION", "Watching")]]]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "ORION");
    expect(row?.state).toBe("WATCH");
  });

  it("Amber maps to WATCH", () => {
    const map = new Map([["HELIX", [makeSnapshot("HELIX", "Amber")]]]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "HELIX");
    expect(row?.state).toBe("WATCH");
  });

  it("Green maps to HEALTHY", () => {
    const map = new Map([["VEGA", [makeSnapshot("VEGA", "Green")]]]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "VEGA");
    expect(row?.state).toBe("HEALTHY");
  });

  it("programme with no snapshot maps to HEALTHY", () => {
    const map = new Map<string, HealthSnapshotItem[]>();
    const result = buildClientHealthProxy(map);
    expect(result.every((r) => r.state === "HEALTHY")).toBe(true);
  });

  it("empty map returns 10 rows (one per PROGRAMME_CODE)", () => {
    const map = new Map<string, HealthSnapshotItem[]>();
    const result = buildClientHealthProxy(map);
    expect(result).toHaveLength(10);
  });

  it("uses the most recent snapshot when multiple exist", () => {
    const map = new Map([
      [
        "ATLAS",
        [
          makeSnapshot("ATLAS", "Red", "2026-01-01"),
          makeSnapshot("ATLAS", "Green", "2026-04-01"),
        ],
      ],
    ]);
    const result = buildClientHealthProxy(map);
    const row = result.find((r) => r.code === "ATLAS");
    expect(row?.state).toBe("HEALTHY");
  });
});

// ---------------------------------------------------------------------------
// buildClientHealthWhat
// ---------------------------------------------------------------------------

describe("buildClientHealthWhat", () => {
  it("returns zero counts for empty states and milestones", () => {
    const result = buildClientHealthWhat([], []);
    expect(result.interveneCount).toBe(0);
    expect(result.watchCount).toBe(0);
    expect(result.visibleProgrammes).toBe(0);
    expect(result.blendedScore).toBeNull();
    expect(result.worstProgramme).toBeNull();
    expect(result.delayedMilestones).toBe(0);
  });

  it("interveneCount counts INTERVENE states correctly", () => {
    const states = [
      { code: "PEGASUS", state: "INTERVENE" as const, snapshotRag: "Red" as const },
      { code: "ORION", state: "INTERVENE" as const, snapshotRag: "Failing" as const },
      { code: "HELIX", state: "HEALTHY" as const, snapshotRag: "Green" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.interveneCount).toBe(2);
  });

  it("watchCount counts WATCH states correctly", () => {
    const states = [
      { code: "PEGASUS", state: "WATCH" as const, snapshotRag: "Amber" as const },
      { code: "ORION", state: "WATCH" as const, snapshotRag: "Watching" as const },
      { code: "HELIX", state: "HEALTHY" as const, snapshotRag: "Green" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.watchCount).toBe(2);
  });

  it("blendedScore is weighted average using RAG_WEIGHT", () => {
    const states = [
      { code: "PEGASUS", state: "INTERVENE" as const, snapshotRag: "Failing" as const },
      { code: "ORION", state: "HEALTHY" as const, snapshotRag: "Green" as const },
    ];
    const expected = Math.round((RAG_WEIGHT["Failing"] + RAG_WEIGHT["Green"]) / 2);
    const result = buildClientHealthWhat(states, []);
    expect(result.blendedScore).toBe(expected);
  });

  it("blendedScore is null when all snapshotRag are null", () => {
    const states = [
      { code: "PEGASUS", state: "HEALTHY" as const, snapshotRag: null },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.blendedScore).toBeNull();
  });

  it("worstProgramme returns first INTERVENE code", () => {
    const states = [
      { code: "PEGASUS", state: "INTERVENE" as const, snapshotRag: "Red" as const },
      { code: "ORION", state: "WATCH" as const, snapshotRag: "Amber" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.worstProgramme).toBe("PEGASUS");
  });

  it("worstProgramme falls back to first WATCH when no INTERVENE", () => {
    const states = [
      { code: "HELIX", state: "HEALTHY" as const, snapshotRag: "Green" as const },
      { code: "VEGA", state: "WATCH" as const, snapshotRag: "Amber" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.worstProgramme).toBe("VEGA");
  });

  it("worstProgramme is null when all HEALTHY", () => {
    const states = [
      { code: "ATLAS", state: "HEALTHY" as const, snapshotRag: "Green" as const },
      { code: "DRACO", state: "HEALTHY" as const, snapshotRag: "Green" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.worstProgramme).toBeNull();
  });

  it("delayedMilestones counts Delayed status correctly", () => {
    const milestones = [
      makeMilestone("Delayed"),
      makeMilestone("Delayed"),
      makeMilestone("On Track"),
      makeMilestone("Complete"),
    ];
    const result = buildClientHealthWhat([], milestones);
    expect(result.delayedMilestones).toBe(2);
  });

  it("visibleProgrammes matches states array length", () => {
    const states = [
      { code: "PEGASUS", state: "HEALTHY" as const, snapshotRag: "Green" as const },
      { code: "ORION", state: "HEALTHY" as const, snapshotRag: "Green" as const },
      { code: "HELIX", state: "INTERVENE" as const, snapshotRag: "Red" as const },
    ];
    const result = buildClientHealthWhat(states, []);
    expect(result.visibleProgrammes).toBe(3);
  });
});
