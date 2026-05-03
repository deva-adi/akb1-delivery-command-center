import { describe, expect, it } from "vitest";
import {
  ROLES,
  ROLE_PRIMARY_NAV,
  isKnownRole,
  navForRole,
} from "@/lib/auth/role-nav";

describe("role-nav map per Master PRD R3.3", () => {
  it.each(ROLES)("role %s has exactly 5 primary nav items", (role) => {
    expect(navForRole(role)).toHaveLength(5);
  });

  it.each(ROLES)("role %s nav items have unique tab keys", (role) => {
    const keys = navForRole(role).map((item) => item.key);
    expect(new Set(keys).size).toBe(5);
  });

  it("PortfolioOwner primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.PortfolioOwner.map((i) => i.key)).toEqual([
      "executive",
      "governance-operating-model",
      "financials",
      "capability-supply-chain",
      "client-health",
    ]);
  });

  it("DeliveryDirector primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.DeliveryDirector.map((i) => i.key)).toEqual([
      "executive",
      "governance-operating-model",
      "delivery-health",
      "capability-supply-chain",
      "ops-sla",
    ]);
  });

  it("FinanceLead primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.FinanceLead.map((i) => i.key)).toEqual([
      "financials",
      "pnl-cockpit",
      "commercial",
      "scenario-planner",
      "change-impact",
    ]);
  });

  it("HRBusinessPartner primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.HRBusinessPartner.map((i) => i.key)).toEqual([
      "capability-supply-chain",
      "workforce",
      "executive",
      "onboarding-first-90-days",
      "notifications",
    ]);
  });

  it("ProgrammeManager primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.ProgrammeManager.map((i) => i.key)).toEqual([
      "delivery-health",
      "flow-velocity",
      "governance-operating-model",
      "risk-raid",
      "ops-sla",
    ]);
  });

  it("ReadOnly primary nav matches Master PRD R3.3", () => {
    expect(ROLE_PRIMARY_NAV.ReadOnly.map((i) => i.key)).toEqual([
      "executive",
      "delivery-health",
      "financials",
      "governance-operating-model",
      "client-health",
    ]);
  });

  it("isKnownRole accepts all canonical roles", () => {
    for (const role of ROLES) {
      expect(isKnownRole(role)).toBe(true);
    }
  });

  it("isKnownRole rejects unknown strings", () => {
    expect(isKnownRole("Admin")).toBe(false);
    expect(isKnownRole("")).toBe(false);
    expect(isKnownRole("portfolioowner")).toBe(false);
  });
});
