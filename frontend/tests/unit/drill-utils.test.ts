/**
 * Unit tests for lib/drill.ts.
 *
 * Covers: getProgrammeParam, buildDrillUrl, buildDrillThroughUrl,
 * buildPortfolioUrl. useProgrammeFilter is tested via getProgrammeParam
 * (same logic; the hook adds only the useSearchParams() adapter).
 */

import { describe, it, expect, vi } from "vitest";
import {
  getProgrammeParam,
  buildDrillUrl,
  buildDrillThroughUrl,
  buildPortfolioUrl,
} from "@/lib/drill";

// Mock next/navigation so the module import succeeds in jsdom
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// ---------------------------------------------------------------------------
// getProgrammeParam
// ---------------------------------------------------------------------------

describe("getProgrammeParam", () => {
  it("returns null when p param is absent", () => {
    expect(getProgrammeParam(new URLSearchParams())).toBeNull();
  });

  it("returns the programme code when p is set", () => {
    expect(getProgrammeParam(new URLSearchParams("p=PEGASUS"))).toBe("PEGASUS");
  });

  it("returns null when other params are present but not p", () => {
    expect(getProgrammeParam(new URLSearchParams("type=Risk&severity=High"))).toBeNull();
  });

  it("returns the first p value when duplicated", () => {
    expect(getProgrammeParam(new URLSearchParams("p=PEGASUS&p=ORION"))).toBe("PEGASUS");
  });
});

// ---------------------------------------------------------------------------
// buildDrillUrl
// ---------------------------------------------------------------------------

describe("buildDrillUrl", () => {
  it("returns base with no query string when params is empty", () => {
    expect(buildDrillUrl("/home/executive", {})).toBe("/home/executive");
  });

  it("sets a single param", () => {
    expect(buildDrillUrl("/home/executive", { p: "PEGASUS" })).toBe(
      "/home/executive?p=PEGASUS",
    );
  });

  it("omits keys with null values", () => {
    expect(buildDrillUrl("/home/executive", { p: null })).toBe("/home/executive");
  });

  it("sets multiple params", () => {
    const result = buildDrillUrl("/home/risk-raid", { p: "PEGASUS", type: "Risk" });
    expect(result).toContain("p=PEGASUS");
    expect(result).toContain("type=Risk");
    expect(result.startsWith("/home/risk-raid?")).toBe(true);
  });

  it("includes only non-null params when some are null", () => {
    const result = buildDrillUrl("/home/risk-raid", { p: "PEGASUS", type: null });
    expect(result).toBe("/home/risk-raid?p=PEGASUS");
  });

  it("URL-encodes special characters in param values", () => {
    const result = buildDrillUrl("/home/x", { q: "hello world" });
    expect(result).toBe("/home/x?q=hello+world");
  });
});

// ---------------------------------------------------------------------------
// buildDrillThroughUrl
// ---------------------------------------------------------------------------

describe("buildDrillThroughUrl", () => {
  it("returns base target tab URL when no programme is set", () => {
    expect(
      buildDrillThroughUrl("delivery-health", new URLSearchParams()),
    ).toBe("/home/delivery-health");
  });

  it("carries ?p= when programme is set", () => {
    expect(
      buildDrillThroughUrl("delivery-health", new URLSearchParams("p=PEGASUS")),
    ).toBe("/home/delivery-health?p=PEGASUS");
  });

  it("does NOT carry tab-specific params (type, severity, sla)", () => {
    const params = new URLSearchParams("p=PEGASUS&type=Risk&severity=High");
    const result = buildDrillThroughUrl("risk-raid", params);
    expect(result).toBe("/home/risk-raid?p=PEGASUS");
    expect(result).not.toContain("type");
    expect(result).not.toContain("severity");
  });

  it("constructs correct path for any tab name", () => {
    expect(
      buildDrillThroughUrl("governance-operating-model", new URLSearchParams("p=ATLAS")),
    ).toBe("/home/governance-operating-model?p=ATLAS");
  });
});

// ---------------------------------------------------------------------------
// buildPortfolioUrl
// ---------------------------------------------------------------------------

describe("buildPortfolioUrl", () => {
  it("returns path unchanged when no query string", () => {
    expect(buildPortfolioUrl("/home/executive")).toBe("/home/executive");
  });

  it("strips the query string", () => {
    expect(buildPortfolioUrl("/home/executive?p=PEGASUS")).toBe("/home/executive");
  });

  it("strips complex multi-param query string", () => {
    expect(
      buildPortfolioUrl("/home/risk-raid?p=PEGASUS&type=Risk&severity=High"),
    ).toBe("/home/risk-raid");
  });

  it("handles paths with no trailing slash or file extension", () => {
    expect(buildPortfolioUrl("/home/audit-trail-console?from=2026-05-01")).toBe(
      "/home/audit-trail-console",
    );
  });

  it("returns empty string when input is empty", () => {
    expect(buildPortfolioUrl("")).toBe("");
  });
});
