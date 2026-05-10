/**
 * Unit tests for buildWIPProxy in lib/flow-velocity.ts.
 *
 * Verifies WIP proxy derivation from milestone status counts.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import { buildWIPProxy, WIP_LIMITS } from "@/lib/flow-velocity";
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

describe("buildWIPProxy", () => {
  it("returns empty array when no milestones", () => {
    expect(buildWIPProxy([])).toHaveLength(0);
  });

  it("counts At Risk and On Track milestones as WIP", () => {
    const milestones = [
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "At Risk" }),
      makeMilestone({ status: "On Track" }),
    ];
    const rows = buildWIPProxy(milestones);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.wip).toBe(3);
  });

  it("does not count Complete milestones as WIP", () => {
    const milestones = [
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "On Track" }),
    ];
    const rows = buildWIPProxy(milestones);
    expect(rows[0]!.wip).toBe(1);
  });

  it("does not count Delayed milestones as WIP", () => {
    const milestones = [
      makeMilestone({ status: "Delayed" }),
      makeMilestone({ status: "On Track" }),
    ];
    const rows = buildWIPProxy(milestones);
    expect(rows[0]!.wip).toBe(1);
  });

  it("breaching is true when wip exceeds the limit", () => {
    const limit = WIP_LIMITS["ANDROMEDA"] ?? 8;
    const milestones = Array.from({ length: limit + 1 }, () =>
      makeMilestone({ programme_code: "ANDROMEDA", status: "On Track" }),
    );
    const rows = buildWIPProxy(milestones);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.breaching).toBe(true);
  });

  it("breaching is false when wip equals the limit", () => {
    const limit = WIP_LIMITS["ANDROMEDA"] ?? 8;
    const milestones = Array.from({ length: limit }, () =>
      makeMilestone({ programme_code: "ANDROMEDA", status: "On Track" }),
    );
    const rows = buildWIPProxy(milestones);
    expect(rows[0]!.breaching).toBe(false);
  });

  it("uses WIP_LIMITS for known programme codes", () => {
    const milestones = [makeMilestone({ programme_code: "PEGASUS", status: "On Track" })];
    const rows = buildWIPProxy(milestones);
    expect(rows[0]!.limit).toBe(WIP_LIMITS["PEGASUS"]);
  });

  it("defaults limit to 15 for unknown programme code", () => {
    const milestones = [makeMilestone({ programme_code: "UNKNOWN_PROG", status: "On Track" })];
    const rows = buildWIPProxy(milestones);
    expect(rows[0]!.limit).toBe(15);
  });
});
