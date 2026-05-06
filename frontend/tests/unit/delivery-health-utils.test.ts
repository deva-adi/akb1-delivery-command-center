/**
 * Unit tests for lib/delivery-health.ts utility functions.
 *
 * Covers: buildKPIs, buildOnTimeByProgramme, buildSlippingMilestones,
 * buildVelocityTrend, buildEstimationAccuracy, computeEVMForProgramme.
 *
 * noUncheckedIndexedAccess is active: all array[n] accesses carry ! because
 * the preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  buildKPIs,
  buildOnTimeByProgramme,
  buildSlippingMilestones,
  buildVelocityTrend,
  buildEstimationAccuracy,
  computeEVMForProgramme,
} from "@/lib/delivery-health";
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

function pastDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function futureDate(daysAhead: number): string {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

// ---------------------------------------------------------------------------
// buildKPIs
// ---------------------------------------------------------------------------

describe("buildKPIs", () => {
  it("returns zeros and stub csat when no milestones", () => {
    const kpis = buildKPIs([]);
    expect(kpis.onTimePct).toBe(0);
    expect(kpis.milestoneAdherencePct).toBe(0);
    expect(kpis.openBlockers).toBe(0);
    expect(kpis.visibleProgrammes).toBe(0);
    expect(kpis.sprintVelocityPts).toBe(0);
    expect(kpis.csat).toBe(4.2);
  });

  it("computes onTimePct as (On Track + Complete) / total", () => {
    const milestones = [
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "At Risk" }),
      makeMilestone({ status: "Delayed" }),
    ];
    const kpis = buildKPIs(milestones);
    expect(kpis.onTimePct).toBe(50);
  });

  it("computes milestoneAdherencePct from past-due milestones", () => {
    const milestones = [
      makeMilestone({ status: "Complete", due_date: pastDate(10) }),
      makeMilestone({ status: "Delayed", due_date: pastDate(5) }),
      makeMilestone({ status: "On Track", due_date: futureDate(30) }),
    ];
    const kpis = buildKPIs(milestones);
    expect(kpis.milestoneAdherencePct).toBe(50);
  });

  it("returns milestoneAdherencePct 100 when no past-due milestones", () => {
    const milestones = [
      makeMilestone({ status: "On Track", due_date: futureDate(30) }),
    ];
    const kpis = buildKPIs(milestones);
    expect(kpis.milestoneAdherencePct).toBe(100);
  });

  it("counts At Risk and Delayed as openBlockers", () => {
    const milestones = [
      makeMilestone({ status: "At Risk" }),
      makeMilestone({ status: "Delayed" }),
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "Complete" }),
    ];
    expect(buildKPIs(milestones).openBlockers).toBe(2);
  });

  it("counts unique programme codes as visibleProgrammes", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS" }),
      makeMilestone({ programme_code: "PEGASUS" }),
      makeMilestone({ programme_code: "PHOENIX" }),
    ];
    expect(buildKPIs(milestones).visibleProgrammes).toBe(2);
  });

  it("returns stub csat 4.2 regardless of input", () => {
    const kpis = buildKPIs([makeMilestone()]);
    expect(kpis.csat).toBe(4.2);
  });
});

// ---------------------------------------------------------------------------
// buildOnTimeByProgramme
// ---------------------------------------------------------------------------

describe("buildOnTimeByProgramme", () => {
  it("groups milestones by programme and computes onTimePct", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "On Track" }),
      makeMilestone({ programme_code: "PEGASUS", status: "Delayed" }),
      makeMilestone({ programme_code: "PHOENIX", status: "Complete" }),
    ];
    const rows = buildOnTimeByProgramme(milestones);
    expect(rows).toHaveLength(2);
    const phoenix = rows.find((r) => r.programmeCode === "PHOENIX")!;
    const pegasus = rows.find((r) => r.programmeCode === "PEGASUS")!;
    expect(phoenix.onTimePct).toBe(100);
    expect(pegasus.onTimePct).toBe(50);
  });

  it("sorts rows by onTimePct descending", () => {
    const milestones = [
      makeMilestone({ programme_code: "LOW", status: "Delayed" }),
      makeMilestone({ programme_code: "HIGH", status: "Complete" }),
    ];
    const rows = buildOnTimeByProgramme(milestones);
    expect(rows[0]!.programmeCode).toBe("HIGH");
    expect(rows[1]!.programmeCode).toBe("LOW");
  });

  it("counts atRisk and delayed correctly", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "At Risk" }),
      makeMilestone({ programme_code: "PEGASUS", status: "At Risk" }),
      makeMilestone({ programme_code: "PEGASUS", status: "Delayed" }),
    ];
    const rows = buildOnTimeByProgramme(milestones);
    expect(rows[0]!.atRisk).toBe(2);
    expect(rows[0]!.delayed).toBe(1);
    expect(rows[0]!.total).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// buildSlippingMilestones
// ---------------------------------------------------------------------------

describe("buildSlippingMilestones", () => {
  it("excludes On Track and Complete milestones", () => {
    const milestones = [
      makeMilestone({ status: "On Track" }),
      makeMilestone({ status: "Complete" }),
      makeMilestone({ status: "At Risk" }),
    ];
    const result = buildSlippingMilestones(milestones);
    expect(result).toHaveLength(1);
    expect(result[0]!.status).toBe("At Risk");
  });

  it("computes slipDays > 0 for past-due milestones", () => {
    const milestones = [
      makeMilestone({ status: "Delayed", due_date: pastDate(20) }),
    ];
    const result = buildSlippingMilestones(milestones);
    expect(result[0]!.slipDays).toBeGreaterThanOrEqual(19);
  });

  it("returns slipDays 0 for future-dated At Risk milestones", () => {
    const milestones = [
      makeMilestone({ status: "At Risk", due_date: futureDate(30) }),
    ];
    const result = buildSlippingMilestones(milestones);
    expect(result[0]!.slipDays).toBe(0);
  });

  it("caps result at 5 items", () => {
    const milestones = Array.from({ length: 10 }, (_, i) =>
      makeMilestone({
        milestone_id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
        status: "Delayed",
        due_date: pastDate(i + 1),
      }),
    );
    expect(buildSlippingMilestones(milestones)).toHaveLength(5);
  });

  it("sorts Delayed before At Risk when slip days equal", () => {
    const milestones = [
      makeMilestone({ status: "At Risk", due_date: futureDate(5) }),
      makeMilestone({ status: "Delayed", due_date: futureDate(5) }),
    ];
    const result = buildSlippingMilestones(milestones);
    expect(result[0]!.status).toBe("Delayed");
  });
});

// ---------------------------------------------------------------------------
// buildVelocityTrend
// ---------------------------------------------------------------------------

describe("buildVelocityTrend", () => {
  it("returns empty array for no milestones", () => {
    expect(buildVelocityTrend([])).toHaveLength(0);
  });

  it("groups milestones by calendar month of due_date", () => {
    const milestones = [
      makeMilestone({ due_date: "2026-01-15", status: "Complete" }),
      makeMilestone({ due_date: "2026-01-28", status: "On Track" }),
      makeMilestone({ due_date: "2026-02-10", status: "Delayed" }),
    ];
    const buckets = buildVelocityTrend(milestones);
    expect(buckets).toHaveLength(2);
    expect(buckets[0]!.completed).toBe(1);
    expect(buckets[0]!.total).toBe(2);
    expect(buckets[1]!.completed).toBe(0);
    expect(buckets[1]!.total).toBe(1);
  });

  it("returns buckets sorted chronologically", () => {
    const milestones = [
      makeMilestone({ due_date: "2026-03-01" }),
      makeMilestone({ due_date: "2026-01-01" }),
      makeMilestone({ due_date: "2026-02-01" }),
    ];
    const buckets = buildVelocityTrend(milestones);
    expect(buckets).toHaveLength(3);
    expect(buckets[0]!.sprint).toBe(0);
    expect(buckets[1]!.sprint).toBe(1);
    expect(buckets[2]!.sprint).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// buildEstimationAccuracy
// ---------------------------------------------------------------------------

describe("buildEstimationAccuracy", () => {
  it("computes accuracy as (On Track + Complete) / total", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "On Track" }),
      makeMilestone({ programme_code: "PEGASUS", status: "Delayed" }),
    ];
    const rows = buildEstimationAccuracy(milestones);
    expect(rows[0]!.accuracy).toBe(50);
  });

  it("counts Delayed milestones with null baseline_date as silentDrift", () => {
    const milestones = [
      makeMilestone({ status: "Delayed", baseline_date: null }),
      makeMilestone({ status: "Delayed", baseline_date: "2026-01-01" }),
      makeMilestone({ status: "On Track", baseline_date: null }),
    ];
    const rows = buildEstimationAccuracy(milestones);
    expect(rows[0]!.silentDrift).toBe(1);
  });

  it("sorts rows accuracy ascending (worst first)", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "Complete" }),
      makeMilestone({ programme_code: "PHOENIX", status: "Delayed" }),
    ];
    const rows = buildEstimationAccuracy(milestones);
    expect(rows[0]!.programmeCode).toBe("PHOENIX");
    expect(rows[1]!.programmeCode).toBe("PEGASUS");
  });
});

// ---------------------------------------------------------------------------
// computeEVMForProgramme
// ---------------------------------------------------------------------------

describe("computeEVMForProgramme", () => {
  it("returns 1.0 SPI for fully on-track programme", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "On Track" }),
      makeMilestone({ programme_code: "PEGASUS", status: "Complete" }),
    ];
    const evm = computeEVMForProgramme(milestones, "PEGASUS");
    expect(evm.spi).toBe(1.0);
  });

  it("returns SPI < 1 when some milestones are delayed", () => {
    const milestones = [
      makeMilestone({ programme_code: "PEGASUS", status: "On Track" }),
      makeMilestone({ programme_code: "PEGASUS", status: "Delayed" }),
    ];
    const evm = computeEVMForProgramme(milestones, "PEGASUS");
    expect(evm.spi).toBe(0.5);
  });

  it("returns neutral metrics when programme has no milestones", () => {
    const evm = computeEVMForProgramme([], "MISSING");
    expect(evm.spi).toBe(1.0);
    expect(evm.cpi).toBe(1.0);
    expect(evm.tcpi).toBe(1.0);
    expect(evm.eacLabel).toBe("N/A");
  });
});
