/**
 * Unit tests for M10-9 Governance KPI cell drill.
 *
 * Tests cover:
 *   - KPI_SLUGS exposes 10 entries
 *   - every slug is non-empty and lowercase-hyphenated (one test per KPI)
 *   - KPI_SLUG_TO_LABEL round-trips all 10 slugs back to their original label
 *   - gate-critical spot checks for Decision Latency Wtd and Sponsor Engagement
 *     are subsumed by the per-KPI tests below.
 */

import { describe, expect, it } from "vitest";
import { KPI_SLUGS, KPI_SLUG_TO_LABEL } from "@/lib/governance";

const SLUG_PATTERN = /^[a-z][a-z-]*[a-z]$/;

describe("Governance KPI drill slugs", () => {
  it("KPI_SLUGS has exactly 10 entries", () => {
    expect(Object.keys(KPI_SLUGS)).toHaveLength(10);
  });

  it("Decision Latency Wtd maps to decision-latency", () => {
    const slug = KPI_SLUGS["Decision Latency Wtd"];
    expect(slug).toBe("decision-latency");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Decisions Open maps to decisions-open", () => {
    const slug = KPI_SLUGS["Decisions Open"];
    expect(slug).toBe("decisions-open");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Cadence Attendance maps to cadence-attendance", () => {
    const slug = KPI_SLUGS["Cadence Attendance"];
    expect(slug).toBe("cadence-attendance");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Cadence Theatre maps to cadence-theatre", () => {
    const slug = KPI_SLUGS["Cadence Theatre"];
    expect(slug).toBe("cadence-theatre");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("RACI Gap maps to raci-gap", () => {
    const slug = KPI_SLUGS["RACI Gap"];
    expect(slug).toBe("raci-gap");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("RACI Overlap maps to raci-overlap", () => {
    const slug = KPI_SLUGS["RACI Overlap"];
    expect(slug).toBe("raci-overlap");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Contract Staleness maps to contract-staleness", () => {
    const slug = KPI_SLUGS["Contract Staleness"];
    expect(slug).toBe("contract-staleness");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Pre-Read Issuance maps to pre-read-issuance", () => {
    const slug = KPI_SLUGS["Pre-Read Issuance"];
    expect(slug).toBe("pre-read-issuance");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Commitment Delta maps to commitment-delta", () => {
    const slug = KPI_SLUGS["Commitment Delta"];
    expect(slug).toBe("commitment-delta");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("Sponsor Engagement maps to sponsor-engagement", () => {
    const slug = KPI_SLUGS["Sponsor Engagement"];
    expect(slug).toBe("sponsor-engagement");
    expect(slug).toMatch(SLUG_PATTERN);
  });

  it("KPI_SLUG_TO_LABEL round-trips all 10 slugs back to their original label", () => {
    for (const [label, slug] of Object.entries(KPI_SLUGS)) {
      expect(KPI_SLUG_TO_LABEL[slug]).toBe(label);
    }
    expect(Object.keys(KPI_SLUG_TO_LABEL)).toHaveLength(10);
  });
});
