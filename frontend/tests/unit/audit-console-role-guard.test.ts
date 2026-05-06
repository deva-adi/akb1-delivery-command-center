/**
 * Role guard tests for the Audit Trail Console.
 *
 * Allowed roles per PRD 26 section 2:
 *   PortfolioOwner, DeliveryDirector, FinanceLead, ProgrammeManager.
 * Redirected: HRBusinessPartner, ReadOnly.
 *
 * isEntryDetailAllowed is also tested here as it is the secondary gate
 * (AP flag) that governs per-row detail access within the console.
 */

import { describe, it, expect } from "vitest";
import { isAuditAllowed, isEntryDetailAllowed, AUDIT_ALLOWED_ROLES } from "@/lib/audit-console";

describe("isAuditAllowed -- page-level gate", () => {
  const allowed = [
    "PortfolioOwner",
    "DeliveryDirector",
    "FinanceLead",
    "ProgrammeManager",
  ];

  const denied = ["HRBusinessPartner", "ReadOnly"];

  for (const role of allowed) {
    it(`allows ${role}`, () => {
      expect(isAuditAllowed(role)).toBe(true);
    });
  }

  for (const role of denied) {
    it(`denies ${role}`, () => {
      expect(isAuditAllowed(role)).toBe(false);
    });
  }

  it("denies an unknown role string", () => {
    expect(isAuditAllowed("SecurityAuditor")).toBe(false);
  });

  it("AUDIT_ALLOWED_ROLES set has exactly 4 entries", () => {
    expect(AUDIT_ALLOWED_ROLES.size).toBe(4);
  });
});

describe("isEntryDetailAllowed -- AP flag gate", () => {
  it("PO with AP can see per-row detail", () => {
    expect(isEntryDetailAllowed(true)).toBe(true);
  });

  it("PO without AP cannot see per-row detail", () => {
    expect(isEntryDetailAllowed(false)).toBe(false);
  });

  it("DD with AP can see per-row detail", () => {
    expect(isEntryDetailAllowed(true)).toBe(true);
  });

  it("DD without AP cannot see per-row detail", () => {
    expect(isEntryDetailAllowed(false)).toBe(false);
  });
});
