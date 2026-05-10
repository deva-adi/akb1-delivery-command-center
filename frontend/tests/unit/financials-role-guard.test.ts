/**
 * Role guard tests for the Financials tab.
 *
 * Verifies isFinancialsAllowed against all 6 known roles plus unknown.
 * DeliveryDirector: not listed in PRD 08 section 2; excluded per D-055.
 * FinanceLead: primary role (position 1 in FL primary nav).
 */

import { describe, it, expect } from "vitest";
import { isFinancialsAllowed, FINANCIALS_ALLOWED_ROLES } from "@/lib/financials";

describe("isFinancialsAllowed role gate", () => {
  it("allows PortfolioOwner", () => {
    expect(isFinancialsAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isFinancialsAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows FinanceLead", () => {
    expect(isFinancialsAllowed("FinanceLead")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isFinancialsAllowed("ReadOnly")).toBe(true);
  });

  it("blocks DeliveryDirector", () => {
    expect(isFinancialsAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isFinancialsAllowed("HRBusinessPartner")).toBe(false);
  });

  it("blocks unknown role string", () => {
    expect(isFinancialsAllowed("SomeUnknownRole")).toBe(false);
  });

  it("FINANCIALS_ALLOWED_ROLES.size is 4", () => {
    expect(FINANCIALS_ALLOWED_ROLES.size).toBe(4);
  });
});
