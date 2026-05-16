/**
 * Render tests for the Over-Optimism section inside GovStakeholderSection.
 *
 * Verifies: flagged badge renders, OK badge renders, programme name visible,
 * empty state, flagged count label, sort order (flagged first).
 *
 * next/navigation is mocked because GovStakeholderSection is now "use client"
 * with useRouter for drill navigation (M10-7).
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GovStakeholderSection } from "@/components/GovStakeholderSection";
import type { OverOptimismRow } from "@/lib/governance";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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
    render(<GovStakeholderSection overOptimismRows={rows} activeProgramme={null} />);
    expect(screen.getByText("PEGASUS")).toBeTruthy();
  });

  it("renders Flagged badge when row.flagged is true", () => {
    const rows = [makeRow({ programmeCode: "PEGASUS", flagged: true })];
    render(<GovStakeholderSection overOptimismRows={rows} activeProgramme={null} />);
    expect(screen.getByTestId("flagged-badge-PEGASUS")).toBeTruthy();
  });

  it("renders OK badge when row.flagged is false", () => {
    const rows = [makeRow({ programmeCode: "PHOENIX", flagged: false })];
    render(<GovStakeholderSection overOptimismRows={rows} activeProgramme={null} />);
    expect(screen.getByTestId("ok-badge-PHOENIX")).toBeTruthy();
  });

  it("renders empty state message when rows is empty", () => {
    render(<GovStakeholderSection overOptimismRows={[]} activeProgramme={null} />);
    expect(screen.getByText("No health data in scope.")).toBeTruthy();
  });

  it("shows flagged count in the summary label", () => {
    const rows = [
      makeRow({ programmeCode: "A", flagged: true }),
      makeRow({ programmeCode: "B", flagged: false }),
    ];
    render(<GovStakeholderSection overOptimismRows={rows} activeProgramme={null} />);
    expect(screen.getByText(/1 programme/)).toBeTruthy();
  });

  it("renders flagged row before non-flagged row (input already sorted by lib)", () => {
    const rows = [
      makeRow({ programmeCode: "FLAGGED", flagged: true }),
      makeRow({ programmeCode: "OK", flagged: false }),
    ];
    render(<GovStakeholderSection overOptimismRows={rows} activeProgramme={null} />);
    const allRows = screen.getAllByTestId(/^governance-row-/);
    expect(allRows[0]!.getAttribute("data-testid")).toBe("governance-row-FLAGGED");
    expect(allRows[1]!.getAttribute("data-testid")).toBe("governance-row-OK");
  });
});
