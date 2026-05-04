/**
 * Unit tests for lib/raids.ts utility functions.
 *
 * Covers: buildHeatMap, buildTop10, buildTrend, computeKPIs.
 * Smoke tests: PO (10 programmes) and DD (3 programmes) aggregation scenarios.
 *
 * noUncheckedIndexedAccess is active in tsconfig: all array[n] accesses
 * carry the ! assertion because the preceding toHaveLength guard proves the
 * element exists.
 */

import { describe, it, expect } from "vitest";
import {
  buildHeatMap,
  buildTop10,
  buildTrend,
  computeKPIs,
  PROGRAMME_CODES,
} from "@/lib/raids";
import type { RaidItem } from "@/lib/raids";

function makeRaid(overrides: Partial<RaidItem> = {}): RaidItem {
  return {
    raid_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    raid_type: "Risk",
    title: "Test risk",
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

describe("buildHeatMap", () => {
  it("counts only Open and Escalated rows, not Mitigated/Closed", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Open" }),
      makeRaid({ severity: "Critical", status: "Mitigated" }),
      makeRaid({ severity: "High", status: "Closed" }),
      makeRaid({ severity: "High", status: "Escalated" }),
    ];
    const rows = buildHeatMap(raids);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.critical).toBe(1);
    expect(rows[0]!.high).toBe(1);
  });

  it("groups counts by programme_code", () => {
    const raids = [
      makeRaid({ programme_code: "PEGASUS", severity: "Critical", status: "Open" }),
      makeRaid({ programme_code: "PEGASUS", severity: "High", status: "Open" }),
      makeRaid({ programme_code: "PHOENIX", severity: "Medium", status: "Escalated" }),
    ];
    const rows = buildHeatMap(raids);
    expect(rows).toHaveLength(2);
    const pegasus = rows.find((r) => r.programmeCode === "PEGASUS")!;
    expect(pegasus.critical).toBe(1);
    expect(pegasus.high).toBe(1);
    expect(pegasus.medium).toBe(0);
    const phoenix = rows.find((r) => r.programmeCode === "PHOENIX")!;
    expect(phoenix.medium).toBe(1);
  });

  it("sorts rows by total descending", () => {
    const raids = [
      makeRaid({ programme_code: "LOW", severity: "Low", status: "Open" }),
      makeRaid({ programme_code: "HIGH", severity: "Critical", status: "Open" }),
      makeRaid({ programme_code: "HIGH", severity: "Critical", status: "Open" }),
    ];
    const rows = buildHeatMap(raids);
    expect(rows[0]!.programmeCode).toBe("HIGH");
    expect(rows[1]!.programmeCode).toBe("LOW");
  });

  it("computes total as sum of all severities", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Open" }),
      makeRaid({ severity: "High", status: "Open" }),
      makeRaid({ severity: "Medium", status: "Open" }),
      makeRaid({ severity: "Low", status: "Open" }),
    ];
    const rows = buildHeatMap(raids);
    expect(rows[0]!.total).toBe(4);
  });

  it("smoke: PO with 10 programmes produces 10 heat map rows", () => {
    const raids = PROGRAMME_CODES.flatMap((code) => [
      makeRaid({ programme_code: code, severity: "High", status: "Open" }),
      makeRaid({ programme_code: code, severity: "Medium", status: "Open" }),
    ]);
    const rows = buildHeatMap(raids);
    expect(rows).toHaveLength(10);
  });

  it("smoke: DD with 3 programmes produces 3 heat map rows", () => {
    const ddCodes = ["STELLAR", "ORION", "PEGASUS"];
    const raids = ddCodes.flatMap((code) => [
      makeRaid({ programme_code: code, severity: "High", status: "Open" }),
    ]);
    const rows = buildHeatMap(raids);
    expect(rows).toHaveLength(3);
  });
});

describe("buildTop10", () => {
  it("returns at most 10 items", () => {
    const raids = Array.from({ length: 20 }, (_, i) =>
      makeRaid({
        raid_id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
        severity: "High",
        status: "Open",
      }),
    );
    expect(buildTop10(raids)).toHaveLength(10);
  });

  it("excludes Medium and Low severity", () => {
    const raids = [
      makeRaid({ severity: "Medium", status: "Open" }),
      makeRaid({ severity: "Low", status: "Open" }),
      makeRaid({ severity: "High", status: "Open" }),
    ];
    const result = buildTop10(raids);
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("High");
  });

  it("excludes Mitigated and Closed status", () => {
    const raids = [
      makeRaid({ severity: "Critical", status: "Mitigated" }),
      makeRaid({ severity: "Critical", status: "Closed" }),
      makeRaid({ severity: "Critical", status: "Open" }),
    ];
    const result = buildTop10(raids);
    expect(result).toHaveLength(1);
    expect(result[0]!.status).toBe("Open");
  });

  it("sorts Critical before High", () => {
    const raids = [
      makeRaid({ raid_id: "a", severity: "High", status: "Open", updated_at: "2026-01-10T00:00:00Z" }),
      makeRaid({ raid_id: "b", severity: "Critical", status: "Open", updated_at: "2026-01-01T00:00:00Z" }),
    ];
    const result = buildTop10(raids);
    expect(result[0]!.severity).toBe("Critical");
    expect(result[1]!.severity).toBe("High");
  });

  it("sorts same severity by updated_at descending", () => {
    const raids = [
      makeRaid({ raid_id: "old", severity: "High", status: "Open", updated_at: "2026-01-01T00:00:00Z" }),
      makeRaid({ raid_id: "new", severity: "High", status: "Open", updated_at: "2026-03-01T00:00:00Z" }),
    ];
    const result = buildTop10(raids);
    expect(result[0]!.raidId).toBe("new");
  });
});

describe("buildTrend", () => {
  it("returns empty array when given no raids", () => {
    expect(buildTrend([])).toHaveLength(0);
  });

  it("places all raids in week 0 when all have same raised_date", () => {
    const raids = [
      makeRaid({ raised_date: "2026-01-01" }),
      makeRaid({ raised_date: "2026-01-01", severity: "Critical" }),
    ];
    const buckets = buildTrend(raids);
    expect(buckets).toHaveLength(1);
    expect(buckets[0]!.week).toBe(0);
    expect(buckets[0]!.high + buckets[0]!.critical).toBe(2);
  });

  it("places raids 7 days apart in week 0 and week 1", () => {
    const raids = [
      makeRaid({ raised_date: "2026-01-01", severity: "High" }),
      makeRaid({ raised_date: "2026-01-08", severity: "Critical" }),
    ];
    const buckets = buildTrend(raids);
    expect(buckets).toHaveLength(2);
    expect(buckets[0]!.high).toBe(1);
    expect(buckets[0]!.critical).toBe(0);
    expect(buckets[1]!.critical).toBe(1);
    expect(buckets[1]!.high).toBe(0);
  });

  it("produces a bucket entry for every week from 0 to max (filling gaps with zeros)", () => {
    const raids = [
      makeRaid({ raised_date: "2026-01-01" }),
      makeRaid({ raised_date: "2026-01-22" }),
    ];
    const buckets = buildTrend(raids);
    expect(buckets).toHaveLength(4);
    const b1 = buckets[1]!;
    const b2 = buckets[2]!;
    expect(b1.high + b1.critical + b1.medium + b1.low).toBe(0);
    expect(b2.high + b2.critical + b2.medium + b2.low).toBe(0);
  });
});

describe("computeKPIs", () => {
  it("counts open and escalated raids as open", () => {
    const raids = [
      makeRaid({ status: "Open" }),
      makeRaid({ status: "Escalated" }),
      makeRaid({ status: "Mitigated" }),
      makeRaid({ status: "Closed" }),
    ];
    expect(computeKPIs(raids).openCount).toBe(2);
  });

  it("counts aging raids older than 30 days among open ones", () => {
    const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const newDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const raids = [
      makeRaid({ status: "Open", raised_date: oldDate }),
      makeRaid({ status: "Open", raised_date: newDate }),
      makeRaid({ status: "Mitigated", raised_date: oldDate }),
    ];
    expect(computeKPIs(raids).agingCount).toBe(1);
  });

  it("counts critical + high open raids as highSevCount", () => {
    const raids = [
      makeRaid({ status: "Open", severity: "Critical" }),
      makeRaid({ status: "Open", severity: "High" }),
      makeRaid({ status: "Open", severity: "Medium" }),
      makeRaid({ status: "Closed", severity: "Critical" }),
    ];
    expect(computeKPIs(raids).highSevCount).toBe(2);
  });
});
