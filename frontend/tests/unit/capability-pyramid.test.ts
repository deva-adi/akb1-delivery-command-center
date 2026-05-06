/**
 * Unit tests for buildPyramidBands in lib/capability.ts.
 *
 * Covers: empty input, single band, all five bands, seed-shape
 * validation, null-band handling, senior/junior counts, seniorPct.
 */

import { describe, it, expect } from "vitest";
import { buildPyramidBands, type PersonItem } from "@/lib/capability";

function makePerson(band: string | null, role = "ReadOnly"): PersonItem {
  return {
    person_id: "00000000-0000-0000-0000-000000000001",
    full_name: "Test",
    role,
    band,
    ap_flag: false,
    overtime_hours_mtd: null,
    last_1on1_sentiment_score: null,
  };
}

describe("buildPyramidBands", () => {
  it("returns zeros and empty counts for an empty array", () => {
    const result = buildPyramidBands([]);
    expect(result.total).toBe(0);
    expect(result.seniorCount).toBe(0);
    expect(result.juniorCount).toBe(0);
    expect(result.seniorPct).toBe(0);
    expect(Object.keys(result.counts)).toHaveLength(0);
  });

  it("counts a single B3 person correctly", () => {
    const result = buildPyramidBands([makePerson("B3")]);
    expect(result.counts["B3"]).toBe(1);
    expect(result.total).toBe(1);
    expect(result.seniorCount).toBe(0);
    expect(result.juniorCount).toBe(0);
  });

  it("counts people with null band in total but not in counts", () => {
    const people = [makePerson("B1"), makePerson(null), makePerson(null)];
    const result = buildPyramidBands(people);
    expect(result.total).toBe(3);
    expect(result.counts["B1"]).toBe(1);
    expect(Object.keys(result.counts)).toHaveLength(1);
  });

  it("computes seniorCount as B4 + B5 headcount", () => {
    const people = [
      makePerson("B4"),
      makePerson("B4"),
      makePerson("B5"),
      makePerson("B3"),
      makePerson("B1"),
    ];
    const result = buildPyramidBands(people);
    expect(result.seniorCount).toBe(3);
  });

  it("computes juniorCount as B1 + B2 headcount", () => {
    const people = [
      makePerson("B1"),
      makePerson("B1"),
      makePerson("B2"),
      makePerson("B5"),
    ];
    const result = buildPyramidBands(people);
    expect(result.juniorCount).toBe(3);
  });

  it("matches the known seed shape: B1=90, B2=90, B3=60, B4=36, B5=24", () => {
    const seed: PersonItem[] = [];
    const seedCounts: Record<string, number> = {
      B1: 90,
      B2: 90,
      B3: 60,
      B4: 36,
      B5: 24,
    };
    for (const [band, count] of Object.entries(seedCounts)) {
      for (let i = 0; i < count; i++) {
        seed.push(makePerson(band));
      }
    }
    const result = buildPyramidBands(seed);
    expect(result.total).toBe(300);
    expect(result.counts["B1"]).toBe(90);
    expect(result.counts["B2"]).toBe(90);
    expect(result.counts["B3"]).toBe(60);
    expect(result.counts["B4"]).toBe(36);
    expect(result.counts["B5"]).toBe(24);
    expect(result.seniorCount).toBe(60);
    expect(result.juniorCount).toBe(180);
  });

  it("computes seniorPct correctly for a simple case", () => {
    const people = [
      makePerson("B4"),
      makePerson("B5"),
      makePerson("B1"),
      makePerson("B1"),
    ];
    const result = buildPyramidBands(people);
    expect(result.seniorPct).toBe(50);
  });

  it("rounds seniorPct to one decimal place", () => {
    const people = [
      makePerson("B5"),
      makePerson("B1"),
      makePerson("B1"),
    ];
    const result = buildPyramidBands(people);
    expect(result.seniorPct).toBe(33.3);
  });
});
