/**
 * Unit tests for financials drill filter utilities (M10-2).
 *
 * Covers: filterFinancialStatesByProgramme, filterFinancialStatesByHealth.
 */

import { describe, it, expect } from "vitest";
import {
  filterFinancialStatesByProgramme,
  filterFinancialStatesByHealth,
  type ProgrammeFinancialState,
} from "@/lib/financials";

function makeState(
  programmeCode: string,
  state: ProgrammeFinancialState["state"],
): ProgrammeFinancialState {
  return { programmeCode, state };
}

const SAMPLE: ProgrammeFinancialState[] = [
  makeState("PEGASUS", "RED"),
  makeState("ORION", "GREEN"),
  makeState("ATLAS", "AMBER"),
  makeState("DRACO", "BREACH"),
  makeState("HELIX", "GREEN"),
];

// ---------------------------------------------------------------------------
// filterFinancialStatesByProgramme
// ---------------------------------------------------------------------------

describe("filterFinancialStatesByProgramme", () => {
  it("returns only the matching programme", () => {
    const result = filterFinancialStatesByProgramme(SAMPLE, "PEGASUS");
    expect(result).toHaveLength(1);
    expect(result[0]!.programmeCode).toBe("PEGASUS");
  });

  it("returns empty when code not found", () => {
    expect(filterFinancialStatesByProgramme(SAMPLE, "DOESNOTEXIST")).toHaveLength(0);
  });

  it("returns empty for empty input", () => {
    expect(filterFinancialStatesByProgramme([], "PEGASUS")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// filterFinancialStatesByHealth
// ---------------------------------------------------------------------------

describe("filterFinancialStatesByHealth", () => {
  it("Red returns RED and BREACH", () => {
    const result = filterFinancialStatesByHealth(SAMPLE, "Red");
    const codes = result.map((s) => s.programmeCode);
    expect(codes).toContain("PEGASUS");
    expect(codes).toContain("DRACO");
    expect(result).toHaveLength(2);
  });

  it("Amber returns AMBER only", () => {
    const result = filterFinancialStatesByHealth(SAMPLE, "Amber");
    expect(result).toHaveLength(1);
    expect(result[0]!.state).toBe("AMBER");
  });

  it("Watching returns AMBER rows", () => {
    const result = filterFinancialStatesByHealth(SAMPLE, "Watching");
    expect(result).toHaveLength(1);
    expect(result[0]!.state).toBe("AMBER");
  });

  it("Green returns GREEN rows only", () => {
    const result = filterFinancialStatesByHealth(SAMPLE, "Green");
    expect(result).toHaveLength(2);
    for (const s of result) expect(s.state).toBe("GREEN");
  });

  it("Failing returns BREACH rows only", () => {
    const result = filterFinancialStatesByHealth(SAMPLE, "Failing");
    expect(result).toHaveLength(1);
    expect(result[0]!.state).toBe("BREACH");
  });

  it("unknown param returns all unfiltered", () => {
    expect(filterFinancialStatesByHealth(SAMPLE, "bogus")).toHaveLength(SAMPLE.length);
  });
});
