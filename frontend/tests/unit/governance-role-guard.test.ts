/**
 * Role guard tests for the Governance Operating Model tab.
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ProgrammeManager,
 *                HRBusinessPartner, ReadOnly.
 * Redirected roles: FinanceLead.
 * Source: Data Model PRD section 3.1.10 access matrix.
 */

import { describe, it, expect } from "vitest";
import { isGovAllowed } from "@/lib/governance";

describe("isGovAllowed", () => {
  it.each([
    ["PortfolioOwner", true],
    ["DeliveryDirector", true],
    ["ProgrammeManager", true],
    ["HRBusinessPartner", true],
    ["ReadOnly", true],
    ["FinanceLead", false],
    ["unknown", false],
    ["", false],
  ])("role %s -> allowed=%s", (role, expected) => {
    expect(isGovAllowed(role)).toBe(expected);
  });
});
