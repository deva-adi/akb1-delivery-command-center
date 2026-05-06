/**
 * Role guard tests for the Delivery Health tab.
 *
 * Allowed roles: DeliveryDirector, ProgrammeManager, ReadOnly.
 * Redirected roles: PortfolioOwner, FinanceLead, HRBusinessPartner.
 * Source: Data Model PRD section 3.1.10 access matrix.
 */

import { describe, it, expect } from "vitest";
import { isDeliveryHealthAllowed } from "@/lib/delivery-health";

describe("isDeliveryHealthAllowed", () => {
  it.each([
    ["DeliveryDirector", true],
    ["ProgrammeManager", true],
    ["ReadOnly", true],
    ["PortfolioOwner", false],
    ["FinanceLead", false],
    ["HRBusinessPartner", false],
    ["unknown", false],
    ["", false],
  ])("role %s -> allowed=%s", (role, expected) => {
    expect(isDeliveryHealthAllowed(role)).toBe(expected);
  });
});
