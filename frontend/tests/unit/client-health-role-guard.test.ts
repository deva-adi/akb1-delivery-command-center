/**
 * Role guard tests for the Client Health tab.
 *
 * Verifies isClientHealthAllowed against all 6 known roles.
 * DeliveryDirector: not listed in PRD 18 section 2; excluded per D-056.
 * HRBusinessPartner: not listed in PRD 18 section 2; excluded per D-056.
 * FinanceLead: listed in PRD 18 section 2; included.
 */

import { describe, it, expect } from "vitest";
import { isClientHealthAllowed, CLIENT_HEALTH_ALLOWED_ROLES } from "@/lib/client-health";

describe("isClientHealthAllowed role gate", () => {
  it("allows PortfolioOwner", () => {
    expect(isClientHealthAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isClientHealthAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows FinanceLead", () => {
    expect(isClientHealthAllowed("FinanceLead")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isClientHealthAllowed("ReadOnly")).toBe(true);
  });

  it("blocks DeliveryDirector", () => {
    expect(isClientHealthAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isClientHealthAllowed("HRBusinessPartner")).toBe(false);
  });

  it("CLIENT_HEALTH_ALLOWED_ROLES does not include DeliveryDirector", () => {
    expect(CLIENT_HEALTH_ALLOWED_ROLES.has("DeliveryDirector")).toBe(false);
  });

  it("CLIENT_HEALTH_ALLOWED_ROLES does not include HRBusinessPartner", () => {
    expect(CLIENT_HEALTH_ALLOWED_ROLES.has("HRBusinessPartner")).toBe(false);
  });
});
