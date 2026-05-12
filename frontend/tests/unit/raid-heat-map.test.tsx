/**
 * Unit tests for RaidHeatMap component.
 *
 * Verifies correct rendering of rows, cell counts, and severity column labels
 * given pre-aggregated HeatMapRow data.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RaidHeatMap } from "@/components/RaidHeatMap";
import type { HeatMapRow } from "@/lib/raids";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/home/risk-raid",
  useSearchParams: () => new URLSearchParams(),
}));

function makeRow(code: string, overrides: Partial<HeatMapRow> = {}): HeatMapRow {
  return {
    programmeCode: code,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
    ...overrides,
  };
}

describe("RaidHeatMap", () => {
  it("renders one table row per input HeatMapRow", () => {
    const rows = [
      makeRow("PEGASUS"),
      makeRow("PHOENIX"),
      makeRow("ORION"),
    ];
    render(<RaidHeatMap rows={rows} />);
    expect(screen.getByTestId("heat-map-row-PEGASUS")).toBeDefined();
    expect(screen.getByTestId("heat-map-row-PHOENIX")).toBeDefined();
    expect(screen.getByTestId("heat-map-row-ORION")).toBeDefined();
  });

  it("displays the correct Critical count in the Critical cell", () => {
    const rows = [makeRow("PEGASUS", { critical: 4, total: 4 })];
    render(<RaidHeatMap rows={rows} />);
    const cell = screen.getByTestId("cell-PEGASUS-Critical");
    expect(cell.textContent).toBe("4");
  });

  it("displays 0 for a programme with no Critical raids", () => {
    const rows = [makeRow("ATLAS", { high: 2, total: 2 })];
    render(<RaidHeatMap rows={rows} />);
    const cell = screen.getByTestId("cell-ATLAS-Critical");
    expect(cell.textContent).toBe("0");
  });

  it("renders the four severity column headers", () => {
    render(<RaidHeatMap rows={[makeRow("VEGA")]} />);
    expect(screen.getByText("Critical")).toBeDefined();
    expect(screen.getByText("High")).toBeDefined();
    expect(screen.getByText("Medium")).toBeDefined();
    expect(screen.getByText("Low")).toBeDefined();
  });

  it("shows portfolio total in the footer", () => {
    const rows = [
      makeRow("PEGASUS", { critical: 2, high: 3, total: 5 }),
      makeRow("PHOENIX", { critical: 1, high: 1, total: 2 }),
    ];
    render(<RaidHeatMap rows={rows} />);
    const table = screen.getByTestId("heat-map-table");
    expect(table.textContent).toContain("Portfolio total");
  });

  it("renders empty state gracefully with no rows", () => {
    render(<RaidHeatMap rows={[]} />);
    expect(screen.getByTestId("heat-map-table")).toBeDefined();
    expect(screen.queryByTestId(/^heat-map-row-/)).toBeNull();
  });
});
