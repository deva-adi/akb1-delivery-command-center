/**
 * Role guard tests for the AI Governance tab.
 *
 * Verifies isAIGovAllowed against all 6 known roles.
 * HRBusinessPartner: explicitly "No" per PRD section 2 -- excluded per D-058.
 * FinanceLead: CADENCE_ONLY access (not blocked at gate, scoped at render).
 * canSeeDetail: false for FL regardless of apFlag.
 */

import { describe, it, expect } from "vitest";
import {
  isAIGovAllowed,
  AI_GOVERNANCE_ALLOWED_ROLES,
  canSeeDetail,
} from "@/lib/ai-governance";

describe("isAIGovAllowed role gate", () => {
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

  it("AI_GOVERNANCE_ALLOWED_ROLES does not include HRBusinessPartner", () => {
    expect(AI_GOVERNANCE_ALLOWED_ROLES.has("HRBusinessPartner")).toBe(false);
  });

  it("canSeeDetail is false for FL regardless of apFlag", () => {
    expect(canSeeDetail("FinanceLead", true)).toBe(false);
    expect(canSeeDetail("FinanceLead", false)).toBe(false);
  });
});
