/**
 * Unit tests for RAID drill filter utilities (M10-3).
 *
 * Covers: filterRaidsByProgramme, filterRaidsBySeverity,
 *         filterRaidsByType, buildFilteredTop10.
 */

import { describe, it, expect } from "vitest";
import {
  filterRaidsByProgramme,
  filterRaidsBySeverity,
  filterRaidsByType,
  buildFilteredTop10,
  type RaidItem,
} from "@/lib/raids";

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

const SAMPLE: RaidItem[] = [
  makeRaid({ raid_id: "1", programme_code: "PEGASUS", severity: "Critical", raid_type: "Risk" }),
  makeRaid({ raid_id: "2", programme_code: "PEGASUS", severity: "High",     raid_type: "Issue" }),
  makeRaid({ raid_id: "3", programme_code: "PHOENIX", severity: "Medium",   raid_type: "Risk" }),
  makeRaid({ raid_id: "4", programme_code: "ORION",   severity: "Low",      raid_type: "Dependency" }),
  makeRaid({ raid_id: "5", programme_code: "PEGASUS", severity: "High",     raid_type: "Assumption" }),
];

// ---------------------------------------------------------------------------
// filterRaidsByProgramme
// ---------------------------------------------------------------------------

describe("filterRaidsByProgramme", () => {
  it("returns only raids for the given programme", () => {
    const result = filterRaidsByProgramme(SAMPLE, "PEGASUS");
    expect(result).toHaveLength(3);
    for (const r of result) expect(r.programme_code).toBe("PEGASUS");
  });

  it("returns empty when programme not found", () => {
    expect(filterRaidsByProgramme(SAMPLE, "DOESNOTEXIST")).toHaveLength(0);
  });

  it("returns empty for empty input", () => {
    expect(filterRaidsByProgramme([], "PEGASUS")).toHaveLength(0);
  });

  it("is case-sensitive", () => {
    expect(filterRaidsByProgramme(SAMPLE, "pegasus")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterRaidsBySeverity
// ---------------------------------------------------------------------------

describe("filterRaidsBySeverity", () => {
  it("filters to Critical only", () => {
    const result = filterRaidsBySeverity(SAMPLE, "Critical");
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("Critical");
  });

  it("filters to High only", () => {
    const result = filterRaidsBySeverity(SAMPLE, "High");
    expect(result).toHaveLength(2);
    for (const r of result) expect(r.severity).toBe("High");
  });

  it("returns all raids unchanged for an unrecognised severity", () => {
    expect(filterRaidsBySeverity(SAMPLE, "bogus")).toHaveLength(SAMPLE.length);
  });

  it("returns empty array for empty input", () => {
    expect(filterRaidsBySeverity([], "High")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterRaidsByType
// ---------------------------------------------------------------------------

describe("filterRaidsByType", () => {
  it("filters to Risk only", () => {
    const result = filterRaidsByType(SAMPLE, "Risk");
    expect(result).toHaveLength(2);
    for (const r of result) expect(r.raid_type).toBe("Risk");
  });

  it("filters to Assumption only", () => {
    const result = filterRaidsByType(SAMPLE, "Assumption");
    expect(result).toHaveLength(1);
    expect(result[0]!.raid_type).toBe("Assumption");
  });

  it("returns all raids unchanged for an unrecognised type", () => {
    expect(filterRaidsByType(SAMPLE, "bogus")).toHaveLength(SAMPLE.length);
  });

  it("returns empty array for empty input", () => {
    expect(filterRaidsByType([], "Risk")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildFilteredTop10
// ---------------------------------------------------------------------------

describe("buildFilteredTop10", () => {
  it("defaults to Critical + High when no severity option given", () => {
    const raids = [
      makeRaid({ raid_id: "h", severity: "High",   status: "Open" }),
      makeRaid({ raid_id: "m", severity: "Medium", status: "Open" }),
      makeRaid({ raid_id: "l", severity: "Low",    status: "Open" }),
    ];
    const result = buildFilteredTop10(raids);
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("High");
  });

  it("filters to the specified severity when severity option given", () => {
    const raids = [
      makeRaid({ raid_id: "c", severity: "Critical", status: "Open" }),
      makeRaid({ raid_id: "h", severity: "High",     status: "Open" }),
      makeRaid({ raid_id: "m", severity: "Medium",   status: "Open" }),
    ];
    const result = buildFilteredTop10(raids, { severity: "Medium" });
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("Medium");
  });

  it("additionally filters by type when type option given", () => {
    const raids = [
      makeRaid({ raid_id: "r",  severity: "Critical", raid_type: "Risk",       status: "Open" }),
      makeRaid({ raid_id: "i",  severity: "Critical", raid_type: "Issue",      status: "Open" }),
      makeRaid({ raid_id: "a",  severity: "Critical", raid_type: "Assumption", status: "Open" }),
    ];
    const result = buildFilteredTop10(raids, { type: "Risk" });
    expect(result).toHaveLength(1);
    expect(result[0]!.raidType).toBe("Risk");
  });

  it("combines severity and type filters", () => {
    const raids = [
      makeRaid({ raid_id: "1", severity: "Critical", raid_type: "Risk",  status: "Open" }),
      makeRaid({ raid_id: "2", severity: "High",     raid_type: "Risk",  status: "Open" }),
      makeRaid({ raid_id: "3", severity: "Critical", raid_type: "Issue", status: "Open" }),
    ];
    const result = buildFilteredTop10(raids, { severity: "Critical", type: "Risk" });
    expect(result).toHaveLength(1);
    expect(result[0]!.raidId).toBe("1");
  });

  it("excludes Mitigated and Closed raids regardless of filters", () => {
    const raids = [
      makeRaid({ raid_id: "open",      severity: "Critical", status: "Open" }),
      makeRaid({ raid_id: "mitigated", severity: "Critical", status: "Mitigated" }),
      makeRaid({ raid_id: "closed",    severity: "Critical", status: "Closed" }),
    ];
    const result = buildFilteredTop10(raids);
    expect(result).toHaveLength(1);
    expect(result[0]!.raidId).toBe("open");
  });

  it("returns at most 10 items", () => {
    const raids = Array.from({ length: 20 }, (_, i) =>
      makeRaid({
        raid_id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
        severity: "Critical",
        status: "Open",
      }),
    );
    expect(buildFilteredTop10(raids)).toHaveLength(10);
  });

  it("sorts Critical before High", () => {
    const raids = [
      makeRaid({ raid_id: "h", severity: "High",     status: "Open" }),
      makeRaid({ raid_id: "c", severity: "Critical", status: "Open" }),
    ];
    const result = buildFilteredTop10(raids);
    expect(result[0]!.severity).toBe("Critical");
  });

  it("returns empty array for empty input", () => {
    expect(buildFilteredTop10([])).toHaveLength(0);
  });
});
