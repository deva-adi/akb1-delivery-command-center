/**
 * Pure utility functions and type definitions for the Capability and Supply
 * Chain tab.
 *
 * Data sources:
 *   GET /api/v1/people   all authenticated roles; no pagination at demo scale
 *
 * Seed reality (2026-05-06): overtime_hours_mtd and last_1on1_sentiment_score
 * are NULL for all 300 seeded people. buildSentimentList returns an empty array
 * against the current seed; the component renders a stub when the list is empty.
 * Both functions remain in place so they activate automatically when the seed
 * is extended.
 */

export const CAPABILITY_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "HRBusinessPartner",
]);

export function isCapabilityAllowed(role: string): boolean {
  return CAPABILITY_ALLOWED_ROLES.has(role);
}

/**
 * Build the GET /api/v1/people URL with optional programme and band filters.
 * Null params are omitted. Both null returns the bare endpoint.
 *
 * buildPeopleUrl("PEGASUS", "B3") => "/api/v1/people?programme=PEGASUS&band=B3"
 * buildPeopleUrl(null, "B3")      => "/api/v1/people?band=B3"
 * buildPeopleUrl(null, null)      => "/api/v1/people"
 */
export function buildPeopleUrl(
  programme: string | null,
  band: string | null,
): string {
  const params = new URLSearchParams();
  if (programme !== null) params.set("programme", programme);
  if (band !== null) params.set("band", band);
  const qs = params.toString();
  return qs ? `/api/v1/people?${qs}` : "/api/v1/people";
}

/**
 * Filter people by band. Excludes people with null band.
 * Used for client-side tests and intersection logic verification.
 */
export function filterPeopleByBand(people: PersonItem[], band: string): PersonItem[] {
  return people.filter((p) => p.band === band);
}

// ---------------------------------------------------------------------------
// API types (mirror openapi.json PersonItem + PeopleListResponse)
// ---------------------------------------------------------------------------

export interface PersonItem {
  person_id: string;
  full_name: string;
  role: string;
  band: string | null;
  ap_flag: boolean;
  overtime_hours_mtd: number | null;
  last_1on1_sentiment_score: number | null;
}

export interface PeopleListResponse {
  items: PersonItem[];
  count: number;
}

// ---------------------------------------------------------------------------
// Pyramid bands
// ---------------------------------------------------------------------------

export interface BandDistribution {
  /** Count per band key. Bands not present in the data have no entry. */
  counts: Record<string, number>;
  total: number;
  /** Sum of B4 + B5 headcount. */
  seniorCount: number;
  /** Sum of B1 + B2 headcount. */
  juniorCount: number;
  /** (B4+B5) / total * 100, rounded to 1 dp. 0 when total is 0. */
  seniorPct: number;
}

const SENIOR_BANDS = new Set(["B4", "B5"]);
const JUNIOR_BANDS = new Set(["B1", "B2"]);

/**
 * Group people by band and compute headcount totals.
 * People with a null band are counted in total but omitted from counts.
 */
export function buildPyramidBands(people: PersonItem[]): BandDistribution {
  const counts: Record<string, number> = {};
  let seniorCount = 0;
  let juniorCount = 0;

  for (const p of people) {
    if (p.band !== null) {
      counts[p.band] = (counts[p.band] ?? 0) + 1;
      if (SENIOR_BANDS.has(p.band)) seniorCount++;
      if (JUNIOR_BANDS.has(p.band)) juniorCount++;
    }
  }

  const total = people.length;
  const seniorPct = total > 0 ? Math.round((seniorCount / total) * 1000) / 10 : 0;

  return { counts, total, seniorCount, juniorCount, seniorPct };
}

// ---------------------------------------------------------------------------
// Sentiment list
// ---------------------------------------------------------------------------

export interface SentimentEntry {
  person_id: string;
  full_name: string;
  role: string;
  score: number;
}

const SENTIMENT_ROLES = new Set(["DeliveryDirector", "ProgrammeManager"]);

/**
 * Return people in DeliveryDirector or ProgrammeManager roles who have a
 * non-null last_1on1_sentiment_score, sorted ascending by score (lowest first,
 * most at risk at top).
 */
export function buildSentimentList(people: PersonItem[]): SentimentEntry[] {
  return people
    .filter(
      (p) => SENTIMENT_ROLES.has(p.role) && p.last_1on1_sentiment_score !== null,
    )
    .map((p) => ({
      person_id: p.person_id,
      full_name: p.full_name,
      role: p.role,
      score: p.last_1on1_sentiment_score as number,
    }))
    .sort((a, b) => a.score - b.score);
}

// ---------------------------------------------------------------------------
// Intelligence card What derivation
// ---------------------------------------------------------------------------

export interface CapabilityWhat {
  totalHeadcount: number;
  bandLine: string;
  seniorLine: string;
  sentimentLine: string | null;
}

/**
 * Build the structured data for the intelligence card What block.
 * Caller composes the prose in the component so the function stays testable.
 *
 * sentimentLine is null when no sentiment scores exist (current seed state).
 */
export function buildCapabilityWhat(
  people: PersonItem[],
): CapabilityWhat {
  const dist = buildPyramidBands(people);
  const sentiment = buildSentimentList(people);

  const bandParts = (["B5", "B4", "B3", "B2", "B1"] as const)
    .filter((b) => (dist.counts[b] ?? 0) > 0)
    .map((b) => `${b}: ${dist.counts[b] ?? 0}`)
    .join(", ");

  const bandLine = bandParts.length > 0 ? bandParts : "band data unavailable";

  const seniorLine =
    dist.total > 0
      ? `Senior band (B4+B5): ${dist.seniorCount} of ${dist.total} (${dist.seniorPct}%).`
      : "Headcount data unavailable.";

  let sentimentLine: string | null = null;
  if (sentiment.length > 0) {
    const below50 = sentiment.filter((e) => e.score < 50).length;
    sentimentLine = `${sentiment.length} delivery managers and PMs with 1-on-1 sentiment scores; ${below50} below 50.`;
  }

  return {
    totalHeadcount: dist.total,
    bandLine,
    seniorLine,
    sentimentLine,
  };
}
