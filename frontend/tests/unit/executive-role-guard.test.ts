/**
 * Role guard tests for the Executive tab.
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ReadOnly.
 * Redirected roles: ProgrammeManager, FinanceLead, HRBusinessPartner.
 * Source: Data Model PRD section 3.1.10 access matrix.
 *
 * Note: HRBusinessPartner was removed from Executive access because
 * Executive is a portfolio P&L surface; HRBP has no financial overview remit.
 * HRBP nav updated to governance-operating-model in position 3 (D-048).
 */

import { describe, it, expect } from "vitest";
import { isExecutiveAllowed } from "@/lib/executive";

describe("isExecutiveAllowed", () => {
  it.each([
    ["PortfolioOwner", true],
    ["DeliveryDirector", true],
    ["ReadOnly", true],
    ["ProgrammeManager", false],
    ["FinanceLead", false],
    ["HRBusinessPartner", false],
    ["unknown", false],
    ["", false],
  ])("role %s -> allowed=%s", (role, expected) => {
    expect(isExecutiveAllowed(role)).toBe(expected);
  });
});
