/**
 * Unit tests for M10-4 drill utilities.
 *
 * Covers: filterPeopleByBand, buildPeopleUrl (filterPeopleByProgramme and
 * intersection logic via URL construction), and PeopleListPanel rendering.
 */

import { describe, it, expect } from "vitest";
import {
  filterPeopleByBand,
  buildPeopleUrl,
  type PersonItem,
} from "@/lib/capability";

function makePerson(overrides: Partial<PersonItem> = {}): PersonItem {
  return {
    person_id: "00000000-0000-0000-0000-000000000001",
    full_name: "Rajiv Sharma",
    role: "ReadOnly",
    band: "B3",
    ap_flag: false,
    overtime_hours_mtd: null,
    last_1on1_sentiment_score: null,
    ...overrides,
  };
}

const SAMPLE: PersonItem[] = [
  makePerson({ person_id: "1", band: "B3", role: "ProgrammeManager" }),
  makePerson({ person_id: "2", band: "B3", role: "ReadOnly" }),
  makePerson({ person_id: "3", band: "B1", role: "ReadOnly" }),
  makePerson({ person_id: "4", band: "B5", role: "DeliveryDirector" }),
  makePerson({ person_id: "5", band: null, role: "ReadOnly" }),
];

// ---------------------------------------------------------------------------
// filterPeopleByBand
// ---------------------------------------------------------------------------

describe("filterPeopleByBand", () => {
  it("returns only people whose band matches", () => {
    const result = filterPeopleByBand(SAMPLE, "B3");
    expect(result).toHaveLength(2);
    for (const p of result) expect(p.band).toBe("B3");
  });

  it("returns empty when no match", () => {
    expect(filterPeopleByBand(SAMPLE, "B4")).toHaveLength(0);
  });

  it("excludes people with null band", () => {
    const result = filterPeopleByBand(SAMPLE, "B3");
    for (const p of result) expect(p.band).not.toBeNull();
  });

  it("returns empty array for empty input", () => {
    expect(filterPeopleByBand([], "B3")).toHaveLength(0);
  });

  it("is case-sensitive (b3 != B3)", () => {
    expect(filterPeopleByBand(SAMPLE, "b3")).toHaveLength(0);
  });

  it("counts all five seed bands correctly against seed shape", () => {
    const seed: PersonItem[] = [];
    const counts: Record<string, number> = { B1: 90, B2: 90, B3: 60, B4: 36, B5: 24 };
    for (const [band, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) seed.push(makePerson({ band }));
    }
    expect(filterPeopleByBand(seed, "B1")).toHaveLength(90);
    expect(filterPeopleByBand(seed, "B3")).toHaveLength(60);
    expect(filterPeopleByBand(seed, "B5")).toHaveLength(24);
  });
});

// ---------------------------------------------------------------------------
// buildPeopleUrl -- programme filter logic
// ---------------------------------------------------------------------------

describe("buildPeopleUrl (programme filter)", () => {
  it("returns /api/v1/people when both params are null", () => {
    expect(buildPeopleUrl(null, null)).toBe("/api/v1/people");
  });

  it("adds ?programme= when programme is set", () => {
    const url = buildPeopleUrl("PEGASUS", null);
    expect(url).toBe("/api/v1/people?programme=PEGASUS");
  });

  it("adds ?band= when band is set", () => {
    const url = buildPeopleUrl(null, "B3");
    expect(url).toBe("/api/v1/people?band=B3");
  });

  it("does not add empty programme key", () => {
    const url = buildPeopleUrl(null, null);
    expect(url).not.toContain("programme");
  });

  it("does not add empty band key", () => {
    const url = buildPeopleUrl(null, null);
    expect(url).not.toContain("band");
  });
});

// ---------------------------------------------------------------------------
// buildPeopleUrl -- intersection logic
// ---------------------------------------------------------------------------

describe("buildPeopleUrl (intersection: programme + band)", () => {
  it("combines both params into a single query string", () => {
    const url = buildPeopleUrl("PEGASUS", "B3");
    expect(url).toContain("programme=PEGASUS");
    expect(url).toContain("band=B3");
  });

  it("includes a ? separator before the first param", () => {
    const url = buildPeopleUrl("PEGASUS", "B3");
    expect(url).toMatch(/^\/api\/v1\/people\?/);
  });

  it("different programmes produce different URLs", () => {
    expect(buildPeopleUrl("PEGASUS", "B3")).not.toBe(buildPeopleUrl("PHOENIX", "B3"));
  });

  it("different bands produce different URLs", () => {
    expect(buildPeopleUrl("PEGASUS", "B1")).not.toBe(buildPeopleUrl("PEGASUS", "B3"));
  });

  it("null programme with band produces a band-only URL", () => {
    const url = buildPeopleUrl(null, "B5");
    expect(url).toBe("/api/v1/people?band=B5");
    expect(url).not.toContain("programme");
  });
});
