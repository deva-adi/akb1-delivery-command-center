/**
 * Unit tests for executive drill filter utilities (M10-2).
 *
 * Covers: filterStatesByProgramme, filterStatesByHealth.
 */

import { describe, it, expect } from "vitest";
import {
  filterStatesByProgramme,
  filterStatesByHealth,
  type ProgrammeStateRow,
} from "@/lib/executive";

function makeRow(
  programmeCode: string,
  display: ProgrammeStateRow["display"],
): ProgrammeStateRow {
  return { programmeCode, display, snapshotDate: "2026-05-01" };
}

const SAMPLE_ROWS: ProgrammeStateRow[] = [
  makeRow("PEGASUS", "RED"),
  makeRow("ORION", "GREEN"),
  makeRow("ATLAS", "AMBER"),
  makeRow("DRACO", "BREACH"),
  makeRow("HELIX", "GREEN"),
];

// ---------------------------------------------------------------------------
// filterStatesByProgramme
// ---------------------------------------------------------------------------

describe("filterStatesByProgramme", () => {
  it("returns only the matching programme row", () => {
    const result = filterStatesByProgramme(SAMPLE_ROWS, "PEGASUS");
    expect(result).toHaveLength(1);
    expect(result[0]!.programmeCode).toBe("PEGASUS");
  });

  it("returns empty array when code does not exist", () => {
    expect(filterStatesByProgramme(SAMPLE_ROWS, "DOESNOTEXIST")).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterStatesByProgramme([], "PEGASUS")).toHaveLength(0);
  });

  it("is case-sensitive (PEGASUS != pegasus)", () => {
    expect(filterStatesByProgramme(SAMPLE_ROWS, "pegasus")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterStatesByHealth
// ---------------------------------------------------------------------------

describe("filterStatesByHealth", () => {
  it("Red filter returns RED and BREACH rows", () => {
    const result = filterStatesByHealth(SAMPLE_ROWS, "Red");
    const codes = result.map((r) => r.programmeCode);
    expect(codes).toContain("PEGASUS");
    expect(codes).toContain("DRACO");
    expect(codes).not.toContain("ORION");
    expect(codes).not.toContain("ATLAS");
  });

  it("Amber filter returns only AMBER rows", () => {
    const result = filterStatesByHealth(SAMPLE_ROWS, "Amber");
    expect(result).toHaveLength(1);
    expect(result[0]!.programmeCode).toBe("ATLAS");
  });

  it("Watching filter also returns AMBER rows", () => {
    const result = filterStatesByHealth(SAMPLE_ROWS, "Watching");
    expect(result).toHaveLength(1);
    expect(result[0]!.display).toBe("AMBER");
  });

  it("Green filter returns only GREEN rows", () => {
    const result = filterStatesByHealth(SAMPLE_ROWS, "Green");
    expect(result).toHaveLength(2);
    for (const row of result) expect(row.display).toBe("GREEN");
  });

  it("Failing filter returns only BREACH rows", () => {
    const result = filterStatesByHealth(SAMPLE_ROWS, "Failing");
    expect(result).toHaveLength(1);
    expect(result[0]!.display).toBe("BREACH");
  });

  it("unknown health param returns all rows unfiltered", () => {
    expect(filterStatesByHealth(SAMPLE_ROWS, "bogus")).toHaveLength(SAMPLE_ROWS.length);
  });

  it("returns empty array for empty input regardless of filter", () => {
    expect(filterStatesByHealth([], "Red")).toHaveLength(0);
  });
});
