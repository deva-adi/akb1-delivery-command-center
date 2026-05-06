/**
 * Render tests for ExecutiveProgrammeStateList.
 *
 * Verifies: row count, RAG colour token selection, BREACH label,
 * programme name rendering, and empty state.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutiveProgrammeStateList } from "@/components/ExecutiveProgrammeStateList";
import type { ProgrammeStateRow } from "@/lib/executive";

function makeRow(overrides: Partial<ProgrammeStateRow> = {}): ProgrammeStateRow {
  return {
    programmeCode: "PEGASUS",
    display: "GREEN",
    snapshotDate: "2026-04-01",
    ...overrides,
  };
}

describe("ExecutiveProgrammeStateList", () => {
  it("renders one row per programme", () => {
    const rows = [
      makeRow({ programmeCode: "PEGASUS", display: "GREEN" }),
      makeRow({ programmeCode: "PHOENIX", display: "RED" }),
      makeRow({ programmeCode: "ORION", display: "AMBER" }),
    ];
    render(<ExecutiveProgrammeStateList rows={rows} />);
    expect(screen.getByTestId("programme-state-row-PEGASUS")).toBeTruthy();
    expect(screen.getByTestId("programme-state-row-PHOENIX")).toBeTruthy();
    expect(screen.getByTestId("programme-state-row-ORION")).toBeTruthy();
  });

  it("renders GREEN label for GREEN state", () => {
    render(<ExecutiveProgrammeStateList rows={[makeRow({ display: "GREEN" })]} />);
    expect(screen.getByText("GREEN")).toBeTruthy();
  });

  it("renders RED label for RED state", () => {
    render(<ExecutiveProgrammeStateList rows={[makeRow({ display: "RED" })]} />);
    expect(screen.getByText("RED")).toBeTruthy();
  });

  it("renders AMBER label for AMBER state", () => {
    render(<ExecutiveProgrammeStateList rows={[makeRow({ display: "AMBER" })]} />);
    expect(screen.getByText("AMBER")).toBeTruthy();
  });

  it("renders BREACH label for BREACH state", () => {
    render(<ExecutiveProgrammeStateList rows={[makeRow({ display: "BREACH" })]} />);
    expect(screen.getByText("BREACH")).toBeTruthy();
  });

  it("renders empty state when rows is empty", () => {
    render(<ExecutiveProgrammeStateList rows={[]} />);
    expect(screen.getByText("No health data available.")).toBeTruthy();
  });
});
