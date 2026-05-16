import { describe, expect, it } from "vitest";
import {
  SIGNAL_SLUGS,
  SIGNAL_SLUG_TO_LABEL,
} from "@/components/ClientSignalMatrix";

describe("Client Health drill signal slugs", () => {
  it("SIGNAL_SLUGS has exactly 6 entries", () => {
    expect(Object.keys(SIGNAL_SLUGS)).toHaveLength(6);
  });

  it("all slug values are lowercase kebab strings", () => {
    for (const slug of Object.values(SIGNAL_SLUGS)) {
      expect(slug).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("maps Escalations 90d to escalations-90d", () => {
    expect(SIGNAL_SLUGS["Escalations 90d"]).toBe("escalations-90d");
  });

  it("maps Missed Exec Mtgs to missed-exec-mtgs", () => {
    expect(SIGNAL_SLUGS["Missed Exec Mtgs"]).toBe("missed-exec-mtgs");
  });

  it("maps Value Realisation to value-realisation", () => {
    expect(SIGNAL_SLUGS["Value Realisation"]).toBe("value-realisation");
  });

  it("every slug round-trips through SIGNAL_SLUG_TO_LABEL", () => {
    for (const [label, slug] of Object.entries(SIGNAL_SLUGS)) {
      expect(SIGNAL_SLUG_TO_LABEL[slug]).toBe(label);
    }
  });

  it("SIGNAL_SLUG_TO_LABEL has exactly 6 entries", () => {
    expect(Object.keys(SIGNAL_SLUG_TO_LABEL)).toHaveLength(6);
  });
});
