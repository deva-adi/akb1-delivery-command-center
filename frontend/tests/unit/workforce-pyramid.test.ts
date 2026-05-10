/**
 * Pyramid data tests for the Workforce Intelligence tab.
 *
 * buildPyramidBands is already fully tested in capability-pyramid.test.ts.
 * This file tests buildWorkforceWhat at the seed scale and verifies the
 * band/senior/junior counts that drive the pyramid component.
 */

import { describe, it, expect } from "vitest";
import { buildWorkforceWhat } from "@/lib/workforce";
import type { PersonItem } from "@/lib/capability";

function makePerson(band: string | null): PersonItem {
  return {
    person_id: "00000000-0000-0000-0000-000000000001",
    full_name: "Test",
    role: "ReadOnly",
    band,
    ap_flag: false,
    overtime_hours_mtd: null,
    last_1on1_sentiment_score: null,
  };
}

function seedPeople(): PersonItem[] {
  const counts: Record<string, number> = {
    B1: 90,
    B2: 90,
    B3: 60,
    B4: 36,
    B5: 24,
  };
  const people: PersonItem[] = [];
  for (const [band, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      people.push(makePerson(band));
    }
  }
  return people;
}

describe("buildWorkforceWhat with seed-shape data", () => {
  it("reports total headcount of 300", () => {
    const result = buildWorkforceWhat(seedPeople());
    expect(result.totalHeadcount).toBe(300);
  });

  it("seniorLine reports 60 senior (B4+B5) of 300", () => {
    const result = buildWorkforceWhat(seedPeople());
    expect(result.seniorLine).toContain("60 of 300");
  });

  it("seniorLine reports 20% (60/300)", () => {
    const result = buildWorkforceWhat(seedPeople());
    expect(result.seniorLine).toContain("20%");
  });

  it("bandLine contains B5 count 24", () => {
    const result = buildWorkforceWhat(seedPeople());
    expect(result.bandLine).toContain("B5: 24");
  });

  it("bandLine contains B1 count 90", () => {
    const result = buildWorkforceWhat(seedPeople());
    expect(result.bandLine).toContain("B1: 90");
  });

  it("overtimeLine is null (seed does not populate overtime_hours_mtd)", () => {
    expect(buildWorkforceWhat(seedPeople()).overtimeLine).toBeNull();
  });

  it("sentimentLine is null (seed does not populate last_1on1_sentiment_score)", () => {
    expect(buildWorkforceWhat(seedPeople()).sentimentLine).toBeNull();
  });

  it("bandLine lists B5 before B1 (descending seniority order)", () => {
    const { bandLine } = buildWorkforceWhat(seedPeople());
    expect(bandLine.indexOf("B5")).toBeLessThan(bandLine.indexOf("B1"));
  });
});
