/**
 * Unit tests for buildSLAMatrix in lib/ops-sla.ts.
 *
 * Verifies SLA matrix derivation from health snapshot sub-RAGs.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import { buildSLAMatrix, SLA_CATEGORIES } from "@/lib/ops-sla";
import type { HealthSnapshotItem } from "@/lib/delivery-health";

function makeSnapshot(
  overrides: Partial<HealthSnapshotItem> = {},
): HealthSnapshotItem {
  return {
    snapshot_id: "00000000-0000-0000-0000-000000000001",
    programme_code: "PEGASUS",
    snapshot_date: "2026-04-01",
    overall_rag: "Green",
    schedule_rag: null,
    budget_rag: null,
    resources_rag: null,
    risks_rag: null,
    commentary: null,
    captured_by_user_id: "00000000-0000-0000-0000-000000000099",
    created_at: "2026-04-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildSLAMatrix", () => {
  it("returns empty array when healthByProgramme is empty", () => {
    expect(buildSLAMatrix({})).toHaveLength(0);
  });

  it("returns one row per programme in the map", () => {
    const health = {
      PEGASUS: [makeSnapshot()],
      ORION: [makeSnapshot({ programme_code: "ORION" })],
    };
    expect(buildSLAMatrix(health)).toHaveLength(2);
  });

  it("each row has exactly 6 cells matching SLA_CATEGORIES", () => {
    const health = { PEGASUS: [makeSnapshot()] };
    const rows = buildSLAMatrix(health);
    expect(rows).toHaveLength(1);
    const cells = rows[0]!.cells;
    expect(cells).toHaveLength(SLA_CATEGORIES.length);
    const cats = cells.map((c) => c.category);
    for (const cat of SLA_CATEGORIES) {
      expect(cats).toContain(cat);
    }
  });

  it("Failing overall_rag maps Uptime cell to BREACH", () => {
    const health = {
      ANDROMEDA: [makeSnapshot({ programme_code: "ANDROMEDA", overall_rag: "Failing" })],
    };
    const rows = buildSLAMatrix(health);
    const uptimeCell = rows[0]!.cells.find((c) => c.category === "Uptime");
    expect(uptimeCell?.state).toBe("BREACH");
  });

  it("Red overall_rag maps Uptime cell to RED", () => {
    const health = {
      PEGASUS: [makeSnapshot({ overall_rag: "Red" })],
    };
    const rows = buildSLAMatrix(health);
    const uptimeCell = rows[0]!.cells.find((c) => c.category === "Uptime");
    expect(uptimeCell?.state).toBe("RED");
  });

  it("Amber overall_rag maps Uptime cell to AMBER", () => {
    const health = {
      PHOENIX: [makeSnapshot({ programme_code: "PHOENIX", overall_rag: "Amber" })],
    };
    const rows = buildSLAMatrix(health);
    const uptimeCell = rows[0]!.cells.find((c) => c.category === "Uptime");
    expect(uptimeCell?.state).toBe("AMBER");
  });

  it("uses schedule_rag for Release category when non-null", () => {
    const health = {
      PEGASUS: [makeSnapshot({ schedule_rag: "Red", overall_rag: "Green" })],
    };
    const rows = buildSLAMatrix(health);
    const releaseCell = rows[0]!.cells.find((c) => c.category === "Release");
    expect(releaseCell?.state).toBe("RED");
  });

  it("falls back to overall_rag for Release when schedule_rag is null", () => {
    const health = {
      PEGASUS: [makeSnapshot({ schedule_rag: null, overall_rag: "Amber" })],
    };
    const rows = buildSLAMatrix(health);
    const releaseCell = rows[0]!.cells.find((c) => c.category === "Release");
    expect(releaseCell?.state).toBe("AMBER");
  });

  it("uses most recent snapshot when multiple exist", () => {
    const health = {
      PEGASUS: [
        makeSnapshot({ snapshot_date: "2026-01-01", overall_rag: "Red" }),
        makeSnapshot({ snapshot_date: "2026-04-01", overall_rag: "Green" }),
      ],
    };
    const rows = buildSLAMatrix(health);
    const uptimeCell = rows[0]!.cells.find((c) => c.category === "Uptime");
    expect(uptimeCell?.state).toBe("GREEN");
  });
});
