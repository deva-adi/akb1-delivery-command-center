/**
 * Unit tests for lib/capability.ts utility functions.
 *
 * Covers: isCapabilityAllowed, buildPyramidBands, buildSentimentList,
 * buildCapabilityWhat, CAPABILITY_ALLOWED_ROLES.
 * Role guard covered in capability-role-guard.test.ts.
 * Pyramid edge cases covered in capability-pyramid.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  isCapabilityAllowed,
  buildSentimentList,
  buildCapabilityWhat,
  CAPABILITY_ALLOWED_ROLES,
  type PersonItem,
} from "@/lib/capability";

function makePerson(overrides: Partial<PersonItem> = {}): PersonItem {
  return {
    person_id: "00000000-0000-0000-0000-000000000001",
    full_name: "Test Person",
    role: "ReadOnly",
    band: "B3",
    ap_flag: false,
    overtime_hours_mtd: null,
    last_1on1_sentiment_score: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isCapabilityAllowed
// ---------------------------------------------------------------------------

describe("isCapabilityAllowed", () => {
  it("allows PortfolioOwner", () => expect(isCapabilityAllowed("PortfolioOwner")).toBe(true));
  it("allows DeliveryDirector", () => expect(isCapabilityAllowed("DeliveryDirector")).toBe(true));
  it("allows HRBusinessPartner", () => expect(isCapabilityAllowed("HRBusinessPartner")).toBe(true));
  it("denies ProgrammeManager", () => expect(isCapabilityAllowed("ProgrammeManager")).toBe(false));
  it("denies ReadOnly", () => expect(isCapabilityAllowed("ReadOnly")).toBe(false));
  it("denies FinanceLead", () => expect(isCapabilityAllowed("FinanceLead")).toBe(false));
  it("denies an unknown role string", () => expect(isCapabilityAllowed("SuperAdmin")).toBe(false));
  it("denies an empty string", () => expect(isCapabilityAllowed("")).toBe(false));
});

describe("CAPABILITY_ALLOWED_ROLES", () => {
  it("has exactly 3 entries", () => expect(CAPABILITY_ALLOWED_ROLES.size).toBe(3));
});

// ---------------------------------------------------------------------------
// buildSentimentList
// ---------------------------------------------------------------------------

describe("buildSentimentList", () => {
  it("returns empty when no people have scores", () => {
    const people = [
      makePerson({ role: "DeliveryDirector", last_1on1_sentiment_score: null }),
      makePerson({ role: "ProgrammeManager", last_1on1_sentiment_score: null }),
    ];
    expect(buildSentimentList(people)).toHaveLength(0);
  });

  it("includes only DeliveryDirector and ProgrammeManager roles", () => {
    const people = [
      makePerson({ role: "DeliveryDirector", last_1on1_sentiment_score: 72 }),
      makePerson({ role: "PortfolioOwner", last_1on1_sentiment_score: 80 }),
      makePerson({ role: "ReadOnly", last_1on1_sentiment_score: 50 }),
    ];
    const result = buildSentimentList(people);
    expect(result).toHaveLength(1);
    expect(result[0]!.role).toBe("DeliveryDirector");
  });

  it("sorts ascending by score (lowest first)", () => {
    const people = [
      makePerson({ role: "ProgrammeManager", last_1on1_sentiment_score: 80 }),
      makePerson({ role: "DeliveryDirector", last_1on1_sentiment_score: 42 }),
      makePerson({ role: "ProgrammeManager", last_1on1_sentiment_score: 65 }),
    ];
    const result = buildSentimentList(people);
    expect(result[0]!.score).toBe(42);
    expect(result[1]!.score).toBe(65);
    expect(result[2]!.score).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// buildCapabilityWhat
// ---------------------------------------------------------------------------

describe("buildCapabilityWhat", () => {
  it("returns total headcount equal to people array length", () => {
    const people = [makePerson(), makePerson(), makePerson()];
    const result = buildCapabilityWhat(people);
    expect(result.totalHeadcount).toBe(3);
  });

  it("returns null sentimentLine when no scores exist (seed reality)", () => {
    const people = [
      makePerson({ role: "DeliveryDirector", last_1on1_sentiment_score: null }),
    ];
    const result = buildCapabilityWhat(people);
    expect(result.sentimentLine).toBeNull();
  });

  it("returns non-null sentimentLine when scores are present", () => {
    const people = [
      makePerson({ role: "DeliveryDirector", last_1on1_sentiment_score: 72 }),
    ];
    const result = buildCapabilityWhat(people);
    expect(result.sentimentLine).not.toBeNull();
    expect(result.sentimentLine).toContain("delivery managers");
  });

  it("bandLine contains B1-B5 labels when data exists", () => {
    const people = [
      makePerson({ band: "B1" }),
      makePerson({ band: "B2" }),
      makePerson({ band: "B5" }),
    ];
    const result = buildCapabilityWhat(people);
    expect(result.bandLine).toContain("B5");
    expect(result.bandLine).toContain("B1");
  });

  it("seniorLine mentions B4+B5 and total", () => {
    const people = [
      makePerson({ band: "B4" }),
      makePerson({ band: "B5" }),
      makePerson({ band: "B1" }),
    ];
    const result = buildCapabilityWhat(people);
    expect(result.seniorLine).toContain("Senior band (B4+B5): 2 of 3");
  });

  it("returns empty state when people array is empty", () => {
    const result = buildCapabilityWhat([]);
    expect(result.totalHeadcount).toBe(0);
    expect(result.sentimentLine).toBeNull();
  });
});
