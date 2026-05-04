/**
 * Unit tests for the Risk and RAID tab role guard.
 *
 * isRaidAllowed is the pure gate function used by page.tsx before
 * rendering or fetching. These tests assert the allowed/denied role set.
 */

import { describe, it, expect } from "vitest";
import { isRaidAllowed, RAID_ALLOWED_ROLES } from "@/lib/raids";

describe("isRaidAllowed", () => {
  const allowed = [
    "PortfolioOwner",
    "DeliveryDirector",
    "ProgrammeManager",
    "FinanceLead",
  ];

  const denied = ["HRBusinessPartner", "ReadOnly"];

  for (const role of allowed) {
    it(`allows ${role}`, () => {
      expect(isRaidAllowed(role)).toBe(true);
    });
  }

  for (const role of denied) {
    it(`denies ${role}`, () => {
      expect(isRaidAllowed(role)).toBe(false);
    });
  }

  it("denies an unknown role string", () => {
    expect(isRaidAllowed("SuperAdmin")).toBe(false);
  });

  it("RAID_ALLOWED_ROLES set has exactly 4 entries", () => {
    expect(RAID_ALLOWED_ROLES.size).toBe(4);
  });
});
