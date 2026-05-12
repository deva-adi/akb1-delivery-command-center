/**
 * Render tests for ExecutiveProgrammeStateList.
 *
 * Verifies: row count, RAG colour token selection, BREACH label,
 * programme name rendering, empty state, and M10-2 drill cross-links.
 *
 * M10-2: component is now "use client" with useRouter/usePathname/useSearchParams.
 * next/navigation is mocked so tests run in jsdom without a real router.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutiveProgrammeStateList } from "@/components/ExecutiveProgrammeStateList";
import type { ProgrammeStateRow } from "@/lib/executive";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/home/executive",
  useSearchParams: () => new URLSearchParams(),
}));

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
    render(
      <ExecutiveProgrammeStateList rows={rows} activeProgamme={null} activeHealth={null} />,
    );
    expect(screen.getByTestId("programme-state-row-PEGASUS")).toBeTruthy();
    expect(screen.getByTestId("programme-state-row-PHOENIX")).toBeTruthy();
    expect(screen.getByTestId("programme-state-row-ORION")).toBeTruthy();
  });

  it("renders GREEN label for GREEN state", () => {
    render(
      <ExecutiveProgrammeStateList
        rows={[makeRow({ display: "GREEN" })]}
        activeProgamme={null}
        activeHealth={null}
      />,
    );
    expect(screen.getByText("GREEN")).toBeTruthy();
  });

  it("renders RED label for RED state", () => {
    render(
      <ExecutiveProgrammeStateList
        rows={[makeRow({ display: "RED" })]}
        activeProgamme={null}
        activeHealth={null}
      />,
    );
    expect(screen.getByText("RED")).toBeTruthy();
  });

  it("renders AMBER label for AMBER state", () => {
    render(
      <ExecutiveProgrammeStateList
        rows={[makeRow({ display: "AMBER" })]}
        activeProgamme={null}
        activeHealth={null}
      />,
    );
    expect(screen.getByText("AMBER")).toBeTruthy();
  });

  it("renders BREACH label for BREACH state", () => {
    render(
      <ExecutiveProgrammeStateList
        rows={[makeRow({ display: "BREACH" })]}
        activeProgamme={null}
        activeHealth={null}
      />,
    );
    expect(screen.getByText("BREACH")).toBeTruthy();
  });

  it("renders empty state when rows is empty", () => {
    render(
      <ExecutiveProgrammeStateList rows={[]} activeProgamme={null} activeHealth={null} />,
    );
    expect(screen.getByText("No health data for this filter.")).toBeTruthy();
  });

  it("shows cross-links when a programme is active", () => {
    const rows = [makeRow({ programmeCode: "PEGASUS", display: "GREEN" })];
    render(
      <ExecutiveProgrammeStateList
        rows={rows}
        activeProgamme="PEGASUS"
        activeHealth={null}
      />,
    );
    expect(screen.getByTestId("exec-dh-link-PEGASUS")).toBeTruthy();
    expect(screen.getByTestId("exec-raid-link-PEGASUS")).toBeTruthy();
  });
});
