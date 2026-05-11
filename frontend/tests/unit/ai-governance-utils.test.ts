/**
 * Unit tests for lib/ai-governance.ts utility functions and constants.
 *
 * Covers: isAIGovAllowed, AI_GOVERNANCE_ALLOWED_ROLES, canSeeDetail,
 * getAccessLevel, RISK_TIERS, FIVE_UNSOLVABLE_AXES, CADENCE_ROWS.
 */

import { describe, it, expect } from "vitest";
import {
  isAIGovAllowed,
  AI_GOVERNANCE_ALLOWED_ROLES,
  canSeeDetail,
  getAccessLevel,
  RISK_TIERS,
  FIVE_UNSOLVABLE_AXES,
  CADENCE_ROWS,
} from "@/lib/ai-governance";

// ---------------------------------------------------------------------------
// isAIGovAllowed
// ---------------------------------------------------------------------------

describe("isAIGovAllowed", () => {
  it("allows PortfolioOwner", () => {
    expect(isAIGovAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows DeliveryDirector", () => {
    expect(isAIGovAllowed("DeliveryDirector")).toBe(true);
  });

  it("allows FinanceLead", () => {
    expect(isAIGovAllowed("FinanceLead")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isAIGovAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isAIGovAllowed("ReadOnly")).toBe(true);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isAIGovAllowed("HRBusinessPartner")).toBe(false);
  });

  it("AI_GOVERNANCE_ALLOWED_ROLES has exactly 5 entries", () => {
    expect(AI_GOVERNANCE_ALLOWED_ROLES.size).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// canSeeDetail
// ---------------------------------------------------------------------------

describe("canSeeDetail", () => {
  it("PO with apFlag true returns true", () => {
    expect(canSeeDetail("PortfolioOwner", true)).toBe(true);
  });

  it("PO with apFlag false returns false", () => {
    expect(canSeeDetail("PortfolioOwner", false)).toBe(false);
  });

  it("DD with apFlag true returns true", () => {
    expect(canSeeDetail("DeliveryDirector", true)).toBe(true);
  });

  it("DD with apFlag false returns false", () => {
    expect(canSeeDetail("DeliveryDirector", false)).toBe(false);
  });

  it("FL with apFlag true returns false", () => {
    expect(canSeeDetail("FinanceLead", true)).toBe(false);
  });

  it("PM with apFlag true returns false", () => {
    expect(canSeeDetail("ProgrammeManager", true)).toBe(false);
  });

  it("RO with apFlag false returns false", () => {
    expect(canSeeDetail("ReadOnly", false)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getAccessLevel
// ---------------------------------------------------------------------------

describe("getAccessLevel", () => {
  it("PO with AP flag returns FULL_AP", () => {
    expect(getAccessLevel("PortfolioOwner", true)).toBe("FULL_AP");
  });

  it("PO without AP flag returns AGGREGATE", () => {
    expect(getAccessLevel("PortfolioOwner", false)).toBe("AGGREGATE");
  });

  it("DD with AP flag returns FULL_AP", () => {
    expect(getAccessLevel("DeliveryDirector", true)).toBe("FULL_AP");
  });

  it("DD without AP flag returns AGGREGATE", () => {
    expect(getAccessLevel("DeliveryDirector", false)).toBe("AGGREGATE");
  });

  it("FL returns CADENCE_ONLY regardless of AP flag", () => {
    expect(getAccessLevel("FinanceLead", true)).toBe("CADENCE_ONLY");
    expect(getAccessLevel("FinanceLead", false)).toBe("CADENCE_ONLY");
  });

  it("PM returns OWN_PROGRAMME", () => {
    expect(getAccessLevel("ProgrammeManager", false)).toBe("OWN_PROGRAMME");
  });

  it("RO returns AGGREGATE_RO", () => {
    expect(getAccessLevel("ReadOnly", false)).toBe("AGGREGATE_RO");
  });
});

// ---------------------------------------------------------------------------
// Static constants
// ---------------------------------------------------------------------------

describe("RISK_TIERS", () => {
  it("has exactly 3 entries", () => {
    expect(RISK_TIERS.length).toBe(3);
  });
});

describe("FIVE_UNSOLVABLE_AXES", () => {
  it("has exactly 5 entries", () => {
    expect(FIVE_UNSOLVABLE_AXES.length).toBe(5);
  });
});

describe("CADENCE_ROWS", () => {
  it("has exactly 4 entries", () => {
    expect(CADENCE_ROWS.length).toBe(4);
  });
});
