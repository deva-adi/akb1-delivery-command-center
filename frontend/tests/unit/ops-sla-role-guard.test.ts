/**
 * Role guard tests for the Ops and SLA tab.
 *
 * Verifies isOpsAllowed against all 6 known roles plus unknown.
 * FinanceLead: PRD 15 section 2 grants penalty-view access; narrowed to
 * redirect at v1 per D-054 (no dedicated FL-only view scoped).
 */

import { describe, it, expect } from "vitest";
import { isOpsAllowed, OPS_ALLOWED_ROLES } from "@/lib/ops-sla";

describe("isOpsAllowed role gate", () => {
  it("allows PortfolioOwner", () => {
    expect(isOpsAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows DeliveryDirector", () => {
    expect(isOpsAllowed("DeliveryDirector")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isOpsAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isOpsAllowed("ReadOnly")).toBe(true);
  });

  it("blocks FinanceLead", () => {
    expect(isOpsAllowed("FinanceLead")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isOpsAllowed("HRBusinessPartner")).toBe(false);
  });

  it("blocks unknown role string", () => {
    expect(isOpsAllowed("SomeUnknownRole")).toBe(false);
  });

  it("OPS_ALLOWED_ROLES.size is 4", () => {
    expect(OPS_ALLOWED_ROLES.size).toBe(4);
  });
});
