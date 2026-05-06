/**
 * Unit tests for lib/governance.ts utility functions.
 *
 * Covers: buildOverOptimismList.
 * Role guard covered in governance-role-guard.test.ts.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry !
 * where a preceding toHaveLength guard proves existence.
 */

import { describe, it, expect } from "vitest";
import { buildOverOptimismList } from "@/lib/governance";
import type { HealthSnapshotItem, MilestoneItem } from "@/lib/delivery-health";

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

describe("buildOverOptimismList", () => {
  it("returns empty array for no input", () => {
    expect(buildOverOptimismList([], [])).toHaveLength(0);
  });

  it("flags a programme with Green most-recent snapshot and Delayed milestones", () => {
    const health = [makeSnap({ overall_rag: "Green" })];
    const milestones = [makeMilestone({ status: "Delayed" })];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.flagged).toBe(true);
  });

  it("does not flag a programme with Green snapshot and no Delayed milestones", () => {
    const health = [makeSnap({ overall_rag: "Green" })];
    const milestones = [makeMilestone({ status: "On Track" })];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows[0]!.flagged).toBe(false);
  });

  it("does not flag a programme with non-Green most-recent snapshot and Delayed milestones", () => {
    const health = [makeSnap({ overall_rag: "Red" })];
    const milestones = [makeMilestone({ status: "Delayed" })];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows[0]!.flagged).toBe(false);
  });

  it("uses the most-recent snapshot when programme has multiple", () => {
    const health = [
      makeSnap({ overall_rag: "Green", snapshot_date: "2026-01-01" }),
      makeSnap({ overall_rag: "Red", snapshot_date: "2026-04-01" }),
    ];
    const milestones = [makeMilestone({ status: "Delayed" })];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows[0]!.flagged).toBe(false);
  });

  it("counts consecutive Green snapshots correctly", () => {
    const health = [
      makeSnap({ overall_rag: "Green", snapshot_date: "2026-04-01" }),
      makeSnap({ overall_rag: "Green", snapshot_date: "2026-03-01" }),
      makeSnap({ overall_rag: "Red", snapshot_date: "2026-02-01" }),
      makeSnap({ overall_rag: "Green", snapshot_date: "2026-01-01" }),
    ];
    const rows = buildOverOptimismList(health, []);
    expect(rows[0]!.greenSnapshotCount).toBe(2);
  });

  it("sorts flagged programmes before non-flagged", () => {
    const health = [
      makeSnap({ programme_code: "ALPHA", overall_rag: "Green" }),
      makeSnap({ programme_code: "BETA", overall_rag: "Red" }),
    ];
    const milestones = [
      makeMilestone({ programme_code: "ALPHA", status: "Delayed" }),
      makeMilestone({ programme_code: "BETA", status: "Delayed" }),
    ];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows[0]!.programmeCode).toBe("ALPHA");
    expect(rows[0]!.flagged).toBe(true);
    expect(rows[1]!.flagged).toBe(false);
  });

  it("counts delayed milestones per programme correctly", () => {
    const health = [makeSnap({ overall_rag: "Green" })];
    const milestones = [
      makeMilestone({ status: "Delayed" }),
      makeMilestone({ status: "Delayed" }),
      makeMilestone({ status: "On Track" }),
    ];
    const rows = buildOverOptimismList(health, milestones);
    expect(rows[0]!.delayedMilestoneCount).toBe(2);
  });

  it("handles programmes with health data but no milestone data", () => {
    const health = [makeSnap({ programme_code: "SOLO", overall_rag: "Green" })];
    const rows = buildOverOptimismList(health, []);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.delayedMilestoneCount).toBe(0);
    expect(rows[0]!.flagged).toBe(false);
  });
});
