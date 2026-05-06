/**
 * Unit tests for lib/audit-console.ts utility functions.
 *
 * Covers: isAuditAllowed, isEntryDetailAllowed, formatTimestamp, and the
 * chip-map accessor functions.
 * Diff logic is covered in audit-console-diff.test.ts.
 * Role guard (isAuditAllowed per role) covered in audit-console-role-guard.test.ts.
 *
 * noUncheckedIndexedAccess is active: array[n] accesses carry !
 * where a preceding toHaveLength guard proves existence.
 */

import { describe, it, expect } from "vitest";
import {
  isAuditAllowed,
  isEntryDetailAllowed,
  formatTimestamp,
  methodChip,
  outcomeChip,
  roleChip,
  AUDIT_ALLOWED_ROLES,
  METHOD_CHIP,
  OUTCOME_CHIP,
} from "@/lib/audit-console";

describe("isAuditAllowed", () => {
  it("allows PortfolioOwner", () => expect(isAuditAllowed("PortfolioOwner")).toBe(true));
  it("allows DeliveryDirector", () => expect(isAuditAllowed("DeliveryDirector")).toBe(true));
  it("allows FinanceLead", () => expect(isAuditAllowed("FinanceLead")).toBe(true));
  it("allows ProgrammeManager", () => expect(isAuditAllowed("ProgrammeManager")).toBe(true));
  it("denies HRBusinessPartner", () => expect(isAuditAllowed("HRBusinessPartner")).toBe(false));
  it("denies ReadOnly", () => expect(isAuditAllowed("ReadOnly")).toBe(false));
  it("denies an unknown role string", () => expect(isAuditAllowed("SuperAdmin")).toBe(false));
  it("denies an empty string", () => expect(isAuditAllowed("")).toBe(false));
});

describe("AUDIT_ALLOWED_ROLES", () => {
  it("has exactly 4 entries", () => expect(AUDIT_ALLOWED_ROLES.size).toBe(4));
});

describe("isEntryDetailAllowed", () => {
  it("allows when ap_flag is true", () => expect(isEntryDetailAllowed(true)).toBe(true));
  it("denies when ap_flag is false", () => expect(isEntryDetailAllowed(false)).toBe(false));
});

describe("formatTimestamp", () => {
  it("formats a valid ISO timestamp in YYYY-MM-DD HH:mm pattern", () => {
    const result = formatTimestamp("2026-04-25T11:42:00Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it("produces correct UTC components for a known timestamp", () => {
    const result = formatTimestamp("2026-04-25T11:42:00Z");
    expect(result).toBe("2026-04-25 11:42");
  });

  it("returns the original string unchanged when the input is not a valid date", () => {
    const bad = "not-a-date";
    expect(formatTimestamp(bad)).toBe(bad);
  });

  it("zero-pads month, day, hour, and minute", () => {
    const result = formatTimestamp("2026-01-05T09:03:00Z");
    expect(result).toBe("2026-01-05 09:03");
  });
});

describe("methodChip", () => {
  it("returns a style for PATCH", () => {
    const s = methodChip("PATCH");
    expect(s.bg.length).toBeGreaterThan(0);
    expect(s.text.length).toBeGreaterThan(0);
  });

  it("returns a style for POST", () => {
    const s = methodChip("POST");
    expect(s.bg).toContain("status-green");
  });

  it("returns a style for PUT", () => {
    const s = methodChip("PUT");
    expect(s.bg.length).toBeGreaterThan(0);
  });

  it("returns a style for DELETE that uses status-red", () => {
    const s = methodChip("DELETE");
    expect(s.bg).toContain("status-red");
  });

  it("returns a default chip for an unknown method", () => {
    const s = methodChip("OPTIONS");
    expect(s.bg).toContain("border-subtle");
  });
});

describe("outcomeChip", () => {
  it("Success uses status-green", () => {
    expect(outcomeChip("Success").bg).toContain("status-green");
  });

  it("Denied uses status-amber", () => {
    expect(outcomeChip("Denied").bg).toContain("status-amber");
  });

  it("ApFlagDenied uses status-amber", () => {
    expect(outcomeChip("ApFlagDenied").bg).toContain("status-amber");
  });

  it("RoleDenied uses status-amber", () => {
    expect(outcomeChip("RoleDenied").bg).toContain("status-amber");
  });

  it("Error uses status-red", () => {
    expect(outcomeChip("Error").bg).toContain("status-red");
  });

  it("returns a default chip for an unknown outcome", () => {
    expect(outcomeChip("Unknown").bg).toContain("border-subtle");
  });
});

describe("roleChip", () => {
  it("PortfolioOwner uses accent-gold", () => {
    expect(roleChip("PortfolioOwner").bg).toContain("accent-gold");
  });

  it("DeliveryDirector uses role-fl-soft", () => {
    expect(roleChip("DeliveryDirector").bg).toContain("role-fl-soft");
  });

  it("ProgrammeManager uses role-pm-soft", () => {
    expect(roleChip("ProgrammeManager").bg).toContain("role-pm-soft");
  });

  it("returns a non-empty style for ReadOnly", () => {
    const s = roleChip("ReadOnly");
    expect(s.bg.length).toBeGreaterThan(0);
  });

  it("returns a default chip for an unknown role", () => {
    expect(roleChip("Ghost").bg).toContain("border-subtle");
  });
});

describe("METHOD_CHIP map completeness", () => {
  it("covers all four mutating HTTP methods", () => {
    expect(Object.keys(METHOD_CHIP)).toEqual(
      expect.arrayContaining(["PATCH", "POST", "PUT", "DELETE"]),
    );
  });
});

describe("OUTCOME_CHIP map completeness", () => {
  it("covers all five outcome values from the backend enum", () => {
    expect(Object.keys(OUTCOME_CHIP)).toEqual(
      expect.arrayContaining([
        "Success",
        "Denied",
        "ApFlagDenied",
        "RoleDenied",
        "Error",
      ]),
    );
  });
});
