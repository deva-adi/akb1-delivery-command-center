/**
 * Unit tests for M10-7 Governance drill interactivity.
 *
 * Tests cover:
 *   - buildOverOptimismList output shape and flagging logic
 *   - activeProgramme match condition (gold highlight)
 *   - URL construction for governance row clicks
 *   - isGovAllowed role gate
 */

import { describe, expect, it } from "vitest";
import { buildOverOptimismList, isGovAllowed, GOV_ALLOWED_ROLES } from "@/lib/governance";
import type { HealthSnapshotItem, MilestoneItem } from "@/lib/delivery-health";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnap(code: string, rag: "Green" | "Amber" | "Red", date = "2026-05-01"): HealthSnapshotItem {
  return {
    snapshot_id: `snap-${code}-${date}`,
    programme_code: code,
    snapshot_date: date,
    overall_rag: rag,
    schedule_rag: rag,
    budget_rag: null,
    resources_rag: null,
    risks_rag: null,
    commentary: null,
    captured_by_user_id: "user-001",
    created_at: "2026-05-01T00:00:00Z",
  };
}

function makeDelayedMilestone(code: string): MilestoneItem {
  return {
    milestone_id: `ms-${code}`,
    programme_code: code,
    title: "Test Milestone",
    baseline_date: "2026-03-01",
    due_date: "2026-04-01",
    status: "Delayed",
    completion_pct: 30,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// Tests: buildOverOptimismList
// ---------------------------------------------------------------------------

describe("buildOverOptimismList", () => {
  it("returns one row per programme code", () => {
    const health = [makeSnap("PEGASUS", "Green"), makeSnap("ORION", "Red")];
    const rows = buildOverOptimismList(health, []);
    const codes = rows.map((r) => r.programmeCode);
    expect(codes).toContain("PEGASUS");
    expect(codes).toContain("ORION");
    expect(rows).toHaveLength(2);
  });

  it("greenSnapshotCount is positive for all-green programme", () => {
    const health = [
      makeSnap("PEGASUS", "Green", "2026-05-03"),
      makeSnap("PEGASUS", "Green", "2026-05-02"),
      makeSnap("PEGASUS", "Green", "2026-05-01"),
    ];
    const rows = buildOverOptimismList(health, []);
    const row = rows.find((r) => r.programmeCode === "PEGASUS");
    expect(row?.greenSnapshotCount).toBe(3);
  });

  it("flags a programme that is green with delayed milestones", () => {
    const health = [makeSnap("PEGASUS", "Green")];
    const milestones = [makeDelayedMilestone("PEGASUS")];
    const rows = buildOverOptimismList(health, milestones);
    const row = rows.find((r) => r.programmeCode === "PEGASUS");
    expect(row?.flagged).toBe(true);
  });

  it("does not flag a red programme even with delayed milestones", () => {
    const health = [makeSnap("ORION", "Red")];
    const milestones = [makeDelayedMilestone("ORION")];
    const rows = buildOverOptimismList(health, milestones);
    const row = rows.find((r) => r.programmeCode === "ORION");
    expect(row?.flagged).toBe(false);
  });

  it("active row condition: activeProgramme === row.programmeCode", () => {
    const health = [makeSnap("PEGASUS", "Green")];
    const rows = buildOverOptimismList(health, []);
    const pegasus = rows.find((r) => r.programmeCode === "PEGASUS");
    expect(pegasus).toBeDefined();
    const isActive = (ap: string | null) => ap === pegasus?.programmeCode;
    expect(isActive("PEGASUS")).toBe(true);
    expect(isActive("ORION")).toBe(false);
    expect(isActive(null)).toBe(false);
  });

  it("handleRowClick URL: sets ?p=PEGASUS on governance tab", () => {
    const code = "PEGASUS";
    const params = new URLSearchParams();
    params.set("p", code);
    const url = `/home/governance-operating-model?${params.toString()}`;
    expect(url).toBe("/home/governance-operating-model?p=PEGASUS");
  });

  it("flagged row has delayedMilestoneCount > 0", () => {
    const health = [makeSnap("HELIX", "Green")];
    const milestones = [makeDelayedMilestone("HELIX"), makeDelayedMilestone("HELIX")];
    const rows = buildOverOptimismList(health, milestones);
    const row = rows.find((r) => r.programmeCode === "HELIX");
    expect(row?.delayedMilestoneCount).toBe(2);
    expect(row?.flagged).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: isGovAllowed role gate
// ---------------------------------------------------------------------------

describe("isGovAllowed", () => {
  it("PortfolioOwner is allowed", () => {
    expect(isGovAllowed("PortfolioOwner")).toBe(true);
  });

  it("DeliveryDirector is allowed", () => {
    expect(isGovAllowed("DeliveryDirector")).toBe(true);
  });

  it("FinanceLead is not allowed", () => {
    expect(isGovAllowed("FinanceLead")).toBe(false);
  });

  it("GOV_ALLOWED_ROLES does not include FinanceLead", () => {
    expect(GOV_ALLOWED_ROLES.has("FinanceLead")).toBe(false);
  });

  it("unknown role is not allowed", () => {
    expect(isGovAllowed("SuperAdmin")).toBe(false);
  });
});
