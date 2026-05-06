/**
 * Render tests for the Over-Optimism section inside GovStakeholderSection.
 *
 * Verifies: flagged badge renders, OK badge renders, programme name visible,
 * empty state, flagged count label, sort order (flagged first).
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GovStakeholderSection } from "@/components/GovStakeholderSection";
import type { OverOptimismRow } from "@/lib/governance";

function makeRow(overrides: Partial<OverOptimismRow> = {}): OverOptimismRow {
  return {
    programmeCode: "PEGASUS",
    greenSnapshotCount: 4,
    delayedMilestoneCount: 2,
    flagged: false,
    ...overrides,
  };
}

describe("GovStakeholderSection over-optimism panel", () => {
  it("renders programme name for each row", () => {
    const rows = [makeRow({ programmeCode: "PEGASUS" })];
    render(<GovStakeholderSection overOptimismRows={rows} />);
    expect(screen.getByText("PEGASUS")).toBeTruthy();
  });

  it("renders Flagged badge when row.flagged is true", () => {
    const rows = [makeRow({ programmeCode: "PEGASUS", flagged: true })];
    render(<GovStakeholderSection overOptimismRows={rows} />);
    expect(screen.getByTestId("flagged-badge-PEGASUS")).toBeTruthy();
  });

  it("renders OK badge when row.flagged is false", () => {
    const rows = [makeRow({ programmeCode: "PHOENIX", flagged: false })];
    render(<GovStakeholderSection overOptimismRows={rows} />);
    expect(screen.getByTestId("ok-badge-PHOENIX")).toBeTruthy();
  });

  it("renders empty state message when rows is empty", () => {
    render(<GovStakeholderSection overOptimismRows={[]} />);
    expect(screen.getByText("No health data in scope.")).toBeTruthy();
  });

  it("shows flagged count in the summary label", () => {
    const rows = [
      makeRow({ programmeCode: "A", flagged: true }),
      makeRow({ programmeCode: "B", flagged: false }),
    ];
    render(<GovStakeholderSection overOptimismRows={rows} />);
    expect(screen.getByText(/1 programme/)).toBeTruthy();
  });

  it("renders flagged row before non-flagged row (input already sorted by lib)", () => {
    const rows = [
      makeRow({ programmeCode: "FLAGGED", flagged: true }),
      makeRow({ programmeCode: "OK", flagged: false }),
    ];
    render(<GovStakeholderSection overOptimismRows={rows} />);
    const allRows = screen.getAllByTestId(/^over-optimism-row-/);
    expect(allRows[0]!.getAttribute("data-testid")).toBe("over-optimism-row-FLAGGED");
    expect(allRows[1]!.getAttribute("data-testid")).toBe("over-optimism-row-OK");
  });
});
