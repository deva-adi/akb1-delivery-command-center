/**
 * Role guard tests for the Flow and Velocity tab.
 *
 * Verifies isFlowAllowed against all 6 known roles plus unknown.
 */

import { describe, it, expect } from "vitest";
import { isFlowAllowed, FLOW_ALLOWED_ROLES } from "@/lib/flow-velocity";

describe("isFlowAllowed role gate", () => {
  it("allows PortfolioOwner", () => {
    expect(isFlowAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows DeliveryDirector", () => {
    expect(isFlowAllowed("DeliveryDirector")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isFlowAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isFlowAllowed("ReadOnly")).toBe(true);
  });

  it("blocks FinanceLead", () => {
    expect(isFlowAllowed("FinanceLead")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isFlowAllowed("HRBusinessPartner")).toBe(false);
  });

  it("blocks unknown role string", () => {
    expect(isFlowAllowed("SomeUnknownRole")).toBe(false);
  });

  it("FLOW_ALLOWED_ROLES.size is 4", () => {
    expect(FLOW_ALLOWED_ROLES.size).toBe(4);
  });
});
