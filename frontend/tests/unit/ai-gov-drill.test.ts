import { describe, expect, it } from "vitest";
import {
  AI_TIER_SLUGS,
  AI_TIER_SLUG_TO_LABEL,
} from "@/components/AIGovRiskTierMatrix";

describe("AI Governance drill tier slugs", () => {
  it("AI_TIER_SLUGS has exactly 4 entries", () => {
    expect(Object.keys(AI_TIER_SLUGS)).toHaveLength(4);
  });

  it("maps Red Pending to red-pending", () => {
    expect(AI_TIER_SLUGS["Red Pending"]).toBe("red-pending");
  });

  it("maps Green to green", () => {
    expect(AI_TIER_SLUGS["Green"]).toBe("green");
  });

  it("all slugs are lowercase kebab strings", () => {
    for (const slug of Object.values(AI_TIER_SLUGS)) {
      expect(slug).toMatch(/^[a-z][a-z-]*$/);
    }
  });

  it("every slug round-trips through AI_TIER_SLUG_TO_LABEL", () => {
    for (const [label, slug] of Object.entries(AI_TIER_SLUGS)) {
      expect(AI_TIER_SLUG_TO_LABEL[slug]).toBe(label);
    }
  });

  it("AI_TIER_SLUG_TO_LABEL has exactly 4 entries", () => {
    expect(Object.keys(AI_TIER_SLUG_TO_LABEL)).toHaveLength(4);
  });
});
