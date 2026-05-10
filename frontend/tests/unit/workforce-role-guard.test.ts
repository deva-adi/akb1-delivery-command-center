/**
 * Role guard tests for the Workforce Intelligence tab.
 *
 * Allowed roles (this slice): PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirected: ProgrammeManager, ReadOnly, FinanceLead.
 *
 * PM/RO/FL partial access per PRD 07 requires allocations, attrition, and
 * utilization entities not yet seeded; deferred per D-051 pattern.
 */

import { describe, it, expect } from "vitest";
import { isWorkforceAllowed, WORKFORCE_ALLOWED_ROLES } from "@/lib/workforce";

describe("isWorkforceAllowed -- page-level gate", () => {
  const allowed = ["PortfolioOwner", "DeliveryDirector", "HRBusinessPartner"];
  const denied = ["ProgrammeManager", "ReadOnly", "FinanceLead"];

  for (const role of allowed) {
    it(`allows ${role}`, () => {
      expect(isWorkforceAllowed(role)).toBe(true);
    });
  }

  for (const role of denied) {
    it(`denies ${role}`, () => {
      expect(isWorkforceAllowed(role)).toBe(false);
    });
  }

  it("denies an unknown role string", () => {
    expect(isWorkforceAllowed("SomeOtherRole")).toBe(false);
  });

  it("WORKFORCE_ALLOWED_ROLES has exactly 3 entries", () => {
    expect(WORKFORCE_ALLOWED_ROLES.size).toBe(3);
  });
});
