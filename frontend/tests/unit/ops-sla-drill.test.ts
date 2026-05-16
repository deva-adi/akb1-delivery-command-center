/**
 * Unit tests for M10-5 Ops and SLA drill utilities.
 *
 * Covers: SLA_SLUGS mapping, SLA_SLUG_TO_CATEGORY round-trip,
 * gate-critical mapping (Ticket MTTR -> incident-response).
 */

import { describe, it, expect } from "vitest";
import {
  SLA_SLUGS,
  SLA_SLUG_TO_CATEGORY,
  SLA_CATEGORIES,
} from "@/lib/ops-sla";

// ---------------------------------------------------------------------------
// SLA_SLUGS
// ---------------------------------------------------------------------------

describe("SLA_SLUGS", () => {
  it("has an entry for every SLA category", () => {
    for (const cat of SLA_CATEGORIES) {
      expect(SLA_SLUGS[cat]).toBeDefined();
    }
  });

  it("maps Ticket MTTR to incident-response (gate-critical)", () => {
    expect(SLA_SLUGS["Ticket MTTR"]).toBe("incident-response");
  });

  it("maps Uptime to uptime", () => {
    expect(SLA_SLUGS["Uptime"]).toBe("uptime");
  });

  it("maps Response to response", () => {
    expect(SLA_SLUGS["Response"]).toBe("response");
  });

  it("maps Quality to quality", () => {
    expect(SLA_SLUGS["Quality"]).toBe("quality");
  });

  it("maps Release to change-mgmt", () => {
    expect(SLA_SLUGS["Release"]).toBe("change-mgmt");
  });

  it("maps Support to support", () => {
    expect(SLA_SLUGS["Support"]).toBe("support");
  });

  it("all slug values are lowercase kebab strings", () => {
    for (const slug of Object.values(SLA_SLUGS)) {
      expect(slug).toMatch(/^[a-z][a-z-]*$/);
    }
  });

  it("produces 6 unique slugs (one per category)", () => {
    const slugs = Object.values(SLA_SLUGS);
    expect(slugs).toHaveLength(SLA_CATEGORIES.length);
    expect(new Set(slugs).size).toBe(SLA_CATEGORIES.length);
  });
});

// ---------------------------------------------------------------------------
// SLA_SLUG_TO_CATEGORY (round-trip)
// ---------------------------------------------------------------------------

describe("SLA_SLUG_TO_CATEGORY", () => {
  it("maps incident-response back to Ticket MTTR (gate-critical)", () => {
    expect(SLA_SLUG_TO_CATEGORY["incident-response"]).toBe("Ticket MTTR");
  });

  it("round-trips every slug back to its source category", () => {
    for (const cat of SLA_CATEGORIES) {
      const slug = SLA_SLUGS[cat];
      expect(SLA_SLUG_TO_CATEGORY[slug]).toBe(cat);
    }
  });

  it("maps uptime back to Uptime", () => {
    expect(SLA_SLUG_TO_CATEGORY["uptime"]).toBe("Uptime");
  });

  it("maps change-mgmt back to Release", () => {
    expect(SLA_SLUG_TO_CATEGORY["change-mgmt"]).toBe("Release");
  });

  it("has exactly 6 entries matching SLA_CATEGORIES length", () => {
    expect(Object.keys(SLA_SLUG_TO_CATEGORY)).toHaveLength(SLA_CATEGORIES.length);
  });
});
