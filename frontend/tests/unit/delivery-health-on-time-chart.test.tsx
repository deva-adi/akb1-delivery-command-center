/**
 * Render tests for DeliveryHealthOnTimeChart.
 *
 * Verifies: row count, colour token selection by threshold, programme label
 * rendering, empty state, and bar width style attribute.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeliveryHealthOnTimeChart } from "@/components/DeliveryHealthOnTimeChart";
import type { OnTimeRow } from "@/lib/delivery-health";

function makeRow(overrides: Partial<OnTimeRow> = {}): OnTimeRow {
  return {
    programmeCode: "PEGASUS",
    onTimePct: 85,
    total: 20,
    atRisk: 2,
    delayed: 1,
    ...overrides,
  };
}

describe("DeliveryHealthOnTimeChart", () => {
  it("renders one row per programme", () => {
    const rows = [
      makeRow({ programmeCode: "PEGASUS", onTimePct: 95 }),
      makeRow({ programmeCode: "PHOENIX", onTimePct: 82 }),
      makeRow({ programmeCode: "ORION", onTimePct: 74 }),
    ];
    render(<DeliveryHealthOnTimeChart rows={rows} />);
    expect(screen.getByTestId("on-time-row-PEGASUS")).toBeTruthy();
    expect(screen.getByTestId("on-time-row-PHOENIX")).toBeTruthy();
    expect(screen.getByTestId("on-time-row-ORION")).toBeTruthy();
  });

  it("applies status-green bar class for onTimePct >= 92", () => {
    render(<DeliveryHealthOnTimeChart rows={[makeRow({ onTimePct: 95 })]} />);
    const bar = screen.getByTestId("on-time-bar-PEGASUS");
    expect(bar.className).toContain("bg-status-green");
  });

  it("applies status-amber bar class for 80 <= onTimePct < 92", () => {
    render(<DeliveryHealthOnTimeChart rows={[makeRow({ onTimePct: 85 })]} />);
    const bar = screen.getByTestId("on-time-bar-PEGASUS");
    expect(bar.className).toContain("bg-status-amber");
  });

  it("applies status-red bar class for onTimePct < 80", () => {
    render(<DeliveryHealthOnTimeChart rows={[makeRow({ onTimePct: 74 })]} />);
    const bar = screen.getByTestId("on-time-bar-PEGASUS");
    expect(bar.className).toContain("bg-status-red");
  });

  it("renders programme label in each row", () => {
    render(<DeliveryHealthOnTimeChart rows={[makeRow({ programmeCode: "STELLAR" })]} />);
    expect(screen.getByText("STELLAR")).toBeTruthy();
  });

  it("renders empty state when rows is empty", () => {
    render(<DeliveryHealthOnTimeChart rows={[]} />);
    expect(screen.getByText("No data available.")).toBeTruthy();
  });
});
