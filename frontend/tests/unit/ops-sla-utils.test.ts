/**
 * Unit tests for lib/ops-sla.ts utility functions.
 *
 * Covers: isOpsAllowed, OPS_ALLOWED_ROLES, SLA_CATEGORIES, buildOpsKPIs,
 * buildOpsWhat.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry ! where a
 * preceding toHaveLength guard proves the element exists.
 */

import { describe, it, expect } from "vitest";
import {
  isOpsAllowed,
  OPS_ALLOWED_ROLES,
  SLA_CATEGORIES,
  buildOpsKPIs,
  buildOpsWhat,
} from "@/lib/ops-sla";
import type { HealthSnapshotItem, MilestoneItem } from "@/lib/delivery-health";

function makeSnapshot(
  code: string,
  overallRag: HealthSnapshotItem["overall_rag"],
  date = "2026-04-01",
): HealthSnapshotItem {
  return {
    snapshot_id: "00000000-0000-0000-0000-000000000001",
    programme_code: code,
    snapshot_date: date,
    overall_rag: overallRag,
    schedule_rag: null,
    budget_rag: null,
    resources_rag: null,
    risks_rag: null,
    commentary: null,
    captured_by_user_id: "00000000-0000-0000-0000-000000000099",
    created_at: "2026-04-01T00:00:00Z",
  };
}

function makeMilestone(
  status: MilestoneItem["status"] = "On Track",
  code = "PEGASUS",
): MilestoneItem {
  return {
    milestone_id: "00000000-0000-0000-0000-000000000001",
    programme_code: code,
    title: "Test milestone",
    baseline_date: null,
    due_date: "2026-06-01",
    status,
    completion_pct: 50,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// isOpsAllowed
// ---------------------------------------------------------------------------

describe("isOpsAllowed", () => {
  it("allows PortfolioOwner", () => {
    expect(isOpsAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows DeliveryDirector", () => {
    expect(isOpsAllowed("DeliveryDirector")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isOpsAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isOpsAllowed("ReadOnly")).toBe(true);
  });

  it("blocks FinanceLead", () => {
    expect(isOpsAllowed("FinanceLead")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isOpsAllowed("HRBusinessPartner")).toBe(false);
  });

  it("OPS_ALLOWED_ROLES has exactly 4 entries", () => {
    expect(OPS_ALLOWED_ROLES.size).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// SLA_CATEGORIES
// ---------------------------------------------------------------------------

describe("SLA_CATEGORIES", () => {
  it("has exactly 6 categories", () => {
    expect(SLA_CATEGORIES).toHaveLength(6);
  });

  it("includes Uptime, Ticket MTTR, Response, Quality, Release, Support", () => {
    const cats = [...SLA_CATEGORIES];
    expect(cats).toContain("Uptime");
    expect(cats).toContain("Ticket MTTR");
    expect(cats).toContain("Response");
    expect(cats).toContain("Quality");
    expect(cats).toContain("Release");
    expect(cats).toContain("Support");
  });
});

// ---------------------------------------------------------------------------
// buildOpsKPIs
// ---------------------------------------------------------------------------

describe("buildOpsKPIs", () => {
  it("returns zeros for empty healthByProgramme", () => {
    const kpis = buildOpsKPIs({});
    expect(kpis.atRiskProgrammes).toBe(0);
    expect(kpis.visibleProgrammes).toBe(0);
  });

  it("counts Red programmes as at-risk", () => {
    const health = {
      PEGASUS: [makeSnapshot("PEGASUS", "Red")],
      ORION: [makeSnapshot("ORION", "Green")],
    };
    const kpis = buildOpsKPIs(health);
    expect(kpis.atRiskProgrammes).toBe(1);
    expect(kpis.visibleProgrammes).toBe(2);
  });

  it("counts Failing programmes as at-risk", () => {
    const health = {
      ANDROMEDA: [makeSnapshot("ANDROMEDA", "Failing")],
    };
    expect(buildOpsKPIs(health).atRiskProgrammes).toBe(1);
  });

  it("does not count Amber programmes as at-risk", () => {
    const health = {
      PHOENIX: [makeSnapshot("PHOENIX", "Amber")],
    };
    expect(buildOpsKPIs(health).atRiskProgrammes).toBe(0);
  });

  it("does not count Watching programmes as at-risk", () => {
    const health = {
      ATLAS: [makeSnapshot("ATLAS", "Watching")],
    };
    expect(buildOpsKPIs(health).atRiskProgrammes).toBe(0);
  });

  it("returns stub values for sla metrics", () => {
    const kpis = buildOpsKPIs({});
    expect(kpis.slaAdherencePctStub).toBe(88.3);
    expect(kpis.activeBreachesStub).toBe(3);
    expect(kpis.penaltyExposureUsdStub).toBe(380);
    expect(kpis.p1Incidents30dStub).toBe(42);
    expect(kpis.mttrHoursStub).toBe(4.2);
  });

  it("uses most recent snapshot when multiple exist", () => {
    const health = {
      PEGASUS: [
        makeSnapshot("PEGASUS", "Red", "2026-01-01"),
        makeSnapshot("PEGASUS", "Green", "2026-04-01"),
      ],
    };
    expect(buildOpsKPIs(health).atRiskProgrammes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildOpsWhat
// ---------------------------------------------------------------------------

describe("buildOpsWhat", () => {
  it("returns zero counts for empty inputs", () => {
    const result = buildOpsWhat({}, []);
    expect(result.atRiskProgrammes).toBe(0);
    expect(result.visibleProgrammes).toBe(0);
    expect(result.delayedMilestones).toBe(0);
    expect(result.worstProgramme).toBeNull();
  });

  it("counts Delayed milestones correctly", () => {
    const milestones = [
      makeMilestone("Delayed"),
      makeMilestone("Delayed"),
      makeMilestone("On Track"),
    ];
    const result = buildOpsWhat({}, milestones);
    expect(result.delayedMilestones).toBe(2);
  });

  it("worstProgramme is Failing programme when present", () => {
    const health = {
      PEGASUS: [makeSnapshot("PEGASUS", "Red")],
      ANDROMEDA: [makeSnapshot("ANDROMEDA", "Failing")],
      ORION: [makeSnapshot("ORION", "Green")],
    };
    expect(buildOpsWhat(health, []).worstProgramme).toBe("ANDROMEDA");
  });

  it("worstProgramme is null when all programmes are Green", () => {
    const health = {
      ORION: [makeSnapshot("ORION", "Green")],
      HELIX: [makeSnapshot("HELIX", "Green")],
    };
    expect(buildOpsWhat(health, []).worstProgramme).toBeNull();
  });
});
