/**
 * Pure utility functions and constants for the AI Governance tab.
 *
 * No data fetch: all ai_use_case, ai_quality_gate, ai_governance_cadence,
 * ai_shadow_survey, ai_five_unsolvable, and ai_delivery_speed_gap entities
 * are absent from the seed. Tab is fully stub-driven except for AP-flag
 * access-level gating which reads from the decoded session token.
 *
 * This is the first tab in M7 with zero Promise.allSettled calls.
 */

import { PROGRAMME_CODES } from "@/lib/raids";

export { PROGRAMME_CODES };

// ---------------------------------------------------------------------------
// Role access
// ---------------------------------------------------------------------------

export const AI_GOVERNANCE_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "FinanceLead",
  "ProgrammeManager",
  "ReadOnly",
]);

export function isAIGovAllowed(role: string): boolean {
  return AI_GOVERNANCE_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// AP-flag detail access
// ---------------------------------------------------------------------------

/**
 * true only for PO and DD when apFlag is true.
 * FL, PM, and RO never receive per-use-case detail regardless of apFlag.
 */
export function canSeeDetail(role: string, apFlag: boolean): boolean {
  return (role === "PortfolioOwner" || role === "DeliveryDirector") && apFlag === true;
}

// ---------------------------------------------------------------------------
// Access levels
// ---------------------------------------------------------------------------

export type AIGovAccessLevel =
  | "FULL_AP"
  | "AGGREGATE"
  | "CADENCE_ONLY"
  | "OWN_PROGRAMME"
  | "AGGREGATE_RO";

/**
 * Derive the access level from role and AP flag.
 * CADENCE_ONLY hides all panels except IntelligenceCard and Cadence (FL scope).
 * FULL_AP is the only level that unlocks per-use-case drill.
 * HRBP never reaches this function (redirected at page gate).
 */
export function getAccessLevel(role: string, apFlag: boolean): AIGovAccessLevel {
  if (role === "PortfolioOwner" || role === "DeliveryDirector") {
    return apFlag ? "FULL_AP" : "AGGREGATE";
  }
  if (role === "FinanceLead") return "CADENCE_ONLY";
  if (role === "ProgrammeManager") return "OWN_PROGRAMME";
  if (role === "ReadOnly") return "AGGREGATE_RO";
  return "AGGREGATE";
}

// ---------------------------------------------------------------------------
// Static constants
// ---------------------------------------------------------------------------

export const RISK_TIERS = ["Green", "Amber", "Red"] as const;
export type RiskTier = (typeof RISK_TIERS)[number];

export const FIVE_UNSOLVABLE_AXES = [
  "Estimation",
  "Scope",
  "Communications",
  "TechDebt",
  "TeamStructure",
] as const;

export type FiveUnsolvableAxis = (typeof FIVE_UNSOLVABLE_AXES)[number];

export type CadenceStatus = "OnTime" | "Slipping" | "Missed";

export interface CadenceRow {
  label: string;
  nextDate: string;
  status: CadenceStatus;
}

export const CADENCE_ROWS: readonly CadenceRow[] = [
  { label: "Weekly DM",               nextDate: "Mon 28 Apr", status: "OnTime"   },
  { label: "Monthly Steerco",         nextDate: "Wed 07 May", status: "OnTime"   },
  { label: "Quarterly Risk Committee", nextDate: "Thu 15 May", status: "Slipping" },
  { label: "Annual Board",            nextDate: "Dec 2026",   status: "OnTime"   },
] as const;
