/**
 * Pure utility functions for the Workforce Intelligence tab.
 *
 * Data source: GET /api/v1/people (300 rows; no pagination at demo scale).
 *
 * Reuses buildPyramidBands and PersonItem from lib/capability.ts -- same
 * endpoint, same grouping logic, no duplication.
 *
 * Seed reality (2026-05-06): overtime_hours_mtd and last_1on1_sentiment_score
 * are NULL for all 300 seeded people. buildWorkforceWhat produces null OT and
 * sentiment lines; the component renders stub notes for those fields. Both
 * activate automatically when the seed is extended.
 */

import { buildPyramidBands, type PersonItem } from "@/lib/capability";

export const WORKFORCE_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "HRBusinessPartner",
]);

export function isWorkforceAllowed(role: string): boolean {
  return WORKFORCE_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// Band display labels (display-layer constants, not stored in seed)
// Source: wireframe v1_04_Workforce_Intelligence.html Pyramid by Band section
// ---------------------------------------------------------------------------

export const BAND_LABELS: Record<string, string> = {
  B5: "Principal / Architect",
  B4: "Senior Manager / Architect",
  B3: "Manager / Tech Lead",
  B2: "Senior Engineer",
  B1: "Engineer / Consultant",
};

export const BAND_ORDER = ["B5", "B4", "B3", "B2", "B1"] as const;

// ---------------------------------------------------------------------------
// Intelligence card What derivation
// ---------------------------------------------------------------------------

export interface WorkforceWhat {
  totalHeadcount: number;
  /** "B5: 24, B4: 36, B3: 60, B2: 90, B1: 90" or fallback string */
  bandLine: string;
  /** "(B4+B5) N of total (X%)" */
  seniorLine: string;
  /** Non-null only when overtime_hours_mtd is seeded for at least one person */
  overtimeLine: string | null;
  /** Non-null only when last_1on1_sentiment_score is seeded for at least one person */
  sentimentLine: string | null;
}

export function buildWorkforceWhat(people: PersonItem[]): WorkforceWhat {
  const dist = buildPyramidBands(people);

  const bandParts = BAND_ORDER.filter((b) => (dist.counts[b] ?? 0) > 0)
    .map((b) => `${b}: ${dist.counts[b] ?? 0}`)
    .join(", ");
  const bandLine = bandParts.length > 0 ? bandParts : "band data unavailable";

  const seniorLine =
    dist.total > 0
      ? `Senior band (B4+B5): ${dist.seniorCount} of ${dist.total} (${dist.seniorPct}%).`
      : "Headcount data unavailable.";

  const peopleWithOT = people.filter((p) => p.overtime_hours_mtd !== null);
  let overtimeLine: string | null = null;
  if (peopleWithOT.length > 0) {
    const totalOT = peopleWithOT.reduce(
      (sum, p) => sum + (p.overtime_hours_mtd ?? 0),
      0,
    );
    const avgOT = totalOT / peopleWithOT.length;
    overtimeLine = `Average overtime MTD: ${avgOT.toFixed(1)} h/person across ${peopleWithOT.length} people reporting.`;
  }

  const peopleWithSentiment = people.filter(
    (p) => p.last_1on1_sentiment_score !== null,
  );
  let sentimentLine: string | null = null;
  if (peopleWithSentiment.length > 0) {
    const below50 = peopleWithSentiment.filter(
      (p) => (p.last_1on1_sentiment_score ?? 100) < 50,
    ).length;
    sentimentLine = `${peopleWithSentiment.length} people with 1-on-1 sentiment scores; ${below50} below 50.`;
  }

  return {
    totalHeadcount: dist.total,
    bandLine,
    seniorLine,
    overtimeLine,
    sentimentLine,
  };
}
