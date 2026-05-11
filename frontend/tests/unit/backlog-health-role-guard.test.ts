/**
 * Role guard tests for the Backlog Health tab.
 *
 * Verifies isBacklogHealthAllowed against all 6 known roles.
 * FinanceLead: explicitly "No" per PRD section 2 -- excluded per D-057.
 * DeliveryDirector: not listed in PRD section 2 -- excluded per D-057.
 * HRBusinessPartner: not listed -- excluded per D-057.
 * Smallest role gate in M7: 3 roles only (PO, PM, RO).
 */

import { describe, it, expect } from "vitest";
import { isBacklogHealthAllowed, BACKLOG_HEALTH_ALLOWED_ROLES } from "@/lib/backlog-health";

describe("isBacklogHealthAllowed role gate", () => {
  it("allows PortfolioOwner", () => {
    expect(isBacklogHealthAllowed("PortfolioOwner")).toBe(true);
  });

  it("allows ProgrammeManager", () => {
    expect(isBacklogHealthAllowed("ProgrammeManager")).toBe(true);
  });

  it("allows ReadOnly", () => {
    expect(isBacklogHealthAllowed("ReadOnly")).toBe(true);
  });

  it("blocks FinanceLead", () => {
    expect(isBacklogHealthAllowed("FinanceLead")).toBe(false);
  });

  it("blocks DeliveryDirector", () => {
    expect(isBacklogHealthAllowed("DeliveryDirector")).toBe(false);
  });

  it("blocks HRBusinessPartner", () => {
    expect(isBacklogHealthAllowed("HRBusinessPartner")).toBe(false);
  });

  it("BACKLOG_HEALTH_ALLOWED_ROLES does not include FinanceLead", () => {
    expect(BACKLOG_HEALTH_ALLOWED_ROLES.has("FinanceLead")).toBe(false);
  });

  it("BACKLOG_HEALTH_ALLOWED_ROLES does not include DeliveryDirector", () => {
    expect(BACKLOG_HEALTH_ALLOWED_ROLES.has("DeliveryDirector")).toBe(false);
  });

  it("BACKLOG_HEALTH_ALLOWED_ROLES size is 3", () => {
    expect(BACKLOG_HEALTH_ALLOWED_ROLES.size).toBe(3);
  });
});
