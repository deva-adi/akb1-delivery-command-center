/**
 * Unit tests for lib/workforce.ts.
 *
 * Covers: isWorkforceAllowed, WORKFORCE_ALLOWED_ROLES, BAND_LABELS,
 * buildWorkforceWhat.
 * Role gate per role covered in workforce-role-guard.test.ts.
 * Pyramid data derivation covered in workforce-pyramid.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  isWorkforceAllowed,
  WORKFORCE_ALLOWED_ROLES,
  BAND_LABELS,
  BAND_ORDER,
  buildWorkforceWhat,
} from "@/lib/workforce";
import type { PersonItem } from "@/lib/capability";

function makePerson(overrides: Partial<PersonItem> = {}): PersonItem {
  return {
    person_id: "00000000-0000-0000-0000-000000000001",
    full_name: "Test",
    role: "ReadOnly",
    band: "B3",
    ap_flag: false,
    overtime_hours_mtd: null,
    last_1on1_sentiment_score: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isWorkforceAllowed
// ---------------------------------------------------------------------------

describe("isWorkforceAllowed", () => {
  it("allows PortfolioOwner", () => expect(isWorkforceAllowed("PortfolioOwner")).toBe(true));
  it("allows DeliveryDirector", () => expect(isWorkforceAllowed("DeliveryDirector")).toBe(true));
  it("allows HRBusinessPartner", () => expect(isWorkforceAllowed("HRBusinessPartner")).toBe(true));
  it("denies ProgrammeManager", () => expect(isWorkforceAllowed("ProgrammeManager")).toBe(false));
  it("denies ReadOnly", () => expect(isWorkforceAllowed("ReadOnly")).toBe(false));
  it("denies FinanceLead", () => expect(isWorkforceAllowed("FinanceLead")).toBe(false));
  it("denies an unknown role string", () => expect(isWorkforceAllowed("Ghost")).toBe(false));
  it("denies an empty string", () => expect(isWorkforceAllowed("")).toBe(false));
});

describe("WORKFORCE_ALLOWED_ROLES", () => {
  it("has exactly 3 entries", () => expect(WORKFORCE_ALLOWED_ROLES.size).toBe(3));
});

// ---------------------------------------------------------------------------
// BAND_LABELS
// ---------------------------------------------------------------------------

describe("BAND_LABELS", () => {
  it("has entries for all 5 bands", () => {
    expect(Object.keys(BAND_LABELS)).toHaveLength(5);
  });

  it("B5 label is non-empty", () => {
    expect(BAND_LABELS["B5"]!.length).toBeGreaterThan(0);
  });

  it("B1 label is non-empty", () => {
    expect(BAND_LABELS["B1"]!.length).toBeGreaterThan(0);
  });

  it("B5 is the highest seniority label (contains Architect or Principal)", () => {
    const label = BAND_LABELS["B5"] ?? "";
    const isHighSeniority = label.includes("Principal") || label.includes("Architect");
    expect(isHighSeniority).toBe(true);
  });

  it("BAND_ORDER contains exactly the 5 expected bands", () => {
    expect(BAND_ORDER).toHaveLength(5);
    expect(BAND_ORDER).toContain("B1");
    expect(BAND_ORDER).toContain("B5");
  });
});

// ---------------------------------------------------------------------------
// buildWorkforceWhat
// ---------------------------------------------------------------------------

describe("buildWorkforceWhat", () => {
  it("returns totalHeadcount equal to people array length", () => {
    const result = buildWorkforceWhat([makePerson(), makePerson()]);
    expect(result.totalHeadcount).toBe(2);
  });

  it("returns 0 headcount for empty array", () => {
    expect(buildWorkforceWhat([]).totalHeadcount).toBe(0);
  });

  it("bandLine includes band code and count for each band present", () => {
    const people = [makePerson({ band: "B3" }), makePerson({ band: "B3" })];
    const result = buildWorkforceWhat(people);
    expect(result.bandLine).toContain("B3");
    expect(result.bandLine).toContain("2");
  });

  it("bandLine lists bands B5 before B1 (senior first)", () => {
    const people = [makePerson({ band: "B1" }), makePerson({ band: "B5" })];
    const result = buildWorkforceWhat(people);
    expect(result.bandLine.indexOf("B5")).toBeLessThan(result.bandLine.indexOf("B1"));
  });

  it("seniorLine mentions B4+B5 count and total", () => {
    const people = [makePerson({ band: "B4" }), makePerson({ band: "B5" }), makePerson({ band: "B1" })];
    const result = buildWorkforceWhat(people);
    expect(result.seniorLine).toContain("2 of 3");
  });

  it("overtimeLine is null when all overtime_hours_mtd are null (seed reality)", () => {
    const people = [makePerson({ overtime_hours_mtd: null })];
    expect(buildWorkforceWhat(people).overtimeLine).toBeNull();
  });

  it("overtimeLine is non-null when at least one person has overtime data", () => {
    const people = [makePerson({ overtime_hours_mtd: 12.4 })];
    expect(buildWorkforceWhat(people).overtimeLine).not.toBeNull();
  });

  it("sentimentLine is null when all last_1on1_sentiment_score are null (seed reality)", () => {
    const people = [makePerson({ last_1on1_sentiment_score: null })];
    expect(buildWorkforceWhat(people).sentimentLine).toBeNull();
  });

  it("sentimentLine is non-null when at least one person has a sentiment score", () => {
    const people = [makePerson({ last_1on1_sentiment_score: 72 })];
    expect(buildWorkforceWhat(people).sentimentLine).not.toBeNull();
  });

  it("sentimentLine counts people below 50 correctly", () => {
    const people = [
      makePerson({ last_1on1_sentiment_score: 40 }),
      makePerson({ last_1on1_sentiment_score: 55 }),
      makePerson({ last_1on1_sentiment_score: 30 }),
    ];
    const result = buildWorkforceWhat(people);
    expect(result.sentimentLine).toContain("2");
  });
});
