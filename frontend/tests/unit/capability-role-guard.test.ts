/**
 * Role guard tests for the Capability and Supply Chain tab.
 *
 * Allowed roles per PRD 24 section 2 (this slice):
 *   PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirected: ProgrammeManager, ReadOnly, FinanceLead.
 *
 * PM/RO/FL partial access per PRD requires entities not yet seeded;
 * deferred to a future slice per D-051 planning decision.
 */

import { describe, it, expect } from "vitest";
import { isCapabilityAllowed, CAPABILITY_ALLOWED_ROLES } from "@/lib/capability";

describe("isCapabilityAllowed -- page-level gate", () => {
  const allowed = ["PortfolioOwner", "DeliveryDirector", "HRBusinessPartner"];
  const denied = ["ProgrammeManager", "ReadOnly", "FinanceLead"];

  for (const role of allowed) {
    it(`allows ${role}`, () => {
      expect(isCapabilityAllowed(role)).toBe(true);
    });
  }

  for (const role of denied) {
    it(`denies ${role}`, () => {
      expect(isCapabilityAllowed(role)).toBe(false);
    });
  }

  it("denies an unknown role string", () => {
    expect(isCapabilityAllowed("Unknown")).toBe(false);
  });

  it("CAPABILITY_ALLOWED_ROLES set has exactly 3 entries", () => {
    expect(CAPABILITY_ALLOWED_ROLES.size).toBe(3);
  });
});
