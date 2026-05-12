/**
 * Unit tests for delivery-health drill filter utilities (M10-3).
 *
 * Covers: filterMilestonesByProgramme, buildMilestoneList.
 */

import { describe, it, expect } from "vitest";
import {
  filterMilestonesByProgramme,
  buildMilestoneList,
  type MilestoneItem,
  type MilestoneStatus,
} from "@/lib/delivery-health";

function makeMilestone(overrides: Partial<MilestoneItem> = {}): MilestoneItem {
  return {
    milestone_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    title: "Test milestone",
    baseline_date: "2026-01-01",
    due_date: "2026-03-01",
    status: "On Track",
    completion_pct: 60,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const SAMPLE: MilestoneItem[] = [
  makeMilestone({ programme_code: "PEGASUS", status: "Delayed",  milestone_id: "a" }),
  makeMilestone({ programme_code: "PEGASUS", status: "At Risk",  milestone_id: "b" }),
  makeMilestone({ programme_code: "PHOENIX", status: "On Track", milestone_id: "c" }),
  makeMilestone({ programme_code: "ORION",   status: "Complete", milestone_id: "d" }),
  makeMilestone({ programme_code: "PEGASUS", status: "Complete", milestone_id: "e" }),
];

// ---------------------------------------------------------------------------
// filterMilestonesByProgramme
// ---------------------------------------------------------------------------

describe("filterMilestonesByProgramme", () => {
  it("returns only milestones for the given programme", () => {
    const result = filterMilestonesByProgramme(SAMPLE, "PEGASUS");
    expect(result).toHaveLength(3);
    for (const m of result) expect(m.programme_code).toBe("PEGASUS");
  });

  it("returns empty array when code does not match any milestone", () => {
    expect(filterMilestonesByProgramme(SAMPLE, "DOESNOTEXIST")).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterMilestonesByProgramme([], "PEGASUS")).toHaveLength(0);
  });

  it("is case-sensitive (PEGASUS != pegasus)", () => {
    expect(filterMilestonesByProgramme(SAMPLE, "pegasus")).toHaveLength(0);
  });

  it("returns a single-programme slice without mutating original", () => {
    const original = [...SAMPLE];
    filterMilestonesByProgramme(SAMPLE, "PEGASUS");
    expect(SAMPLE).toHaveLength(original.length);
  });
});

// ---------------------------------------------------------------------------
// buildMilestoneList
// ---------------------------------------------------------------------------

describe("buildMilestoneList", () => {
  it("returns all milestones (not capped at 5)", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeMilestone({ milestone_id: String(i), status: "Delayed" }),
    );
    expect(buildMilestoneList(many)).toHaveLength(10);
  });

  it("sorts Delayed before At Risk before On Track before Complete", () => {
    const milestones: MilestoneItem[] = [
      makeMilestone({ milestone_id: "1", status: "Complete" }),
      makeMilestone({ milestone_id: "2", status: "On Track" }),
      makeMilestone({ milestone_id: "3", status: "At Risk" }),
      makeMilestone({ milestone_id: "4", status: "Delayed" }),
    ];
    const result = buildMilestoneList(milestones);
    const statuses = result.map((m) => m.status) as MilestoneStatus[];
    expect(statuses[0]).toBe("Delayed");
    expect(statuses[1]).toBe("At Risk");
    expect(statuses[2]).toBe("On Track");
    expect(statuses[3]).toBe("Complete");
  });

  it("within same status, sorts by slipDays descending", () => {
    const today = new Date();
    const farPast = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const nearPast = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const milestones: MilestoneItem[] = [
      makeMilestone({ milestone_id: "near", status: "Delayed", due_date: nearPast }),
      makeMilestone({ milestone_id: "far",  status: "Delayed", due_date: farPast }),
    ];
    const result = buildMilestoneList(milestones);
    expect(result[0]!.milestoneId).toBe("far");
    expect(result[1]!.milestoneId).toBe("near");
  });

  it("maps MilestoneItem fields to SlippingMilestone shape correctly", () => {
    const m = makeMilestone({
      milestone_id: "xyz",
      title: "Deploy v2",
      programme_code: "HELIX",
      due_date: "2026-06-01",
      baseline_date: "2026-05-01",
      status: "At Risk",
      completion_pct: 45,
    });
    const [row] = buildMilestoneList([m]);
    expect(row!.milestoneId).toBe("xyz");
    expect(row!.title).toBe("Deploy v2");
    expect(row!.programmeCode).toBe("HELIX");
    expect(row!.dueDate).toBe("2026-06-01");
    expect(row!.baselineDate).toBe("2026-05-01");
    expect(row!.status).toBe("At Risk");
    expect(row!.completionPct).toBe(45);
  });

  it("returns empty array for empty input", () => {
    expect(buildMilestoneList([])).toHaveLength(0);
  });
});
