"use client";

/**
 * Risk Tier Matrix with drill interactivity (M10-6).
 *
 * Click a tier cell    -> sets ?p=CODE&tier=SLUG
 * Click a row header   -> sets ?p=CODE, clears ?tier=
 * Click a col header   -> sets ?tier=SLUG, preserves ?p= if active
 *
 * activeProgramme and activeTier come from ai-governance/page.tsx (server
 * searchParams). useRouter is used for navigation; useSearchParams is NOT
 * used to avoid requiring a Suspense boundary.
 *
 * Highlighting:
 *   active row  -- gold background tint on the entire row
 *   active col  -- gold underline on the column header
 *   active cell -- gold ring-2 on the cell inner div (row + col intersection)
 *
 * Programme names are real (PROGRAMME_CODES in seed order).
 * All tier counts are stub pending ai_use_case entity.
 * Red Pending column has gold left-edge treatment (Design Foundations R4.4).
 * accessLevel prop and AP-gated rendering logic are unchanged.
 * TODO: replace stub counts with actuals when ai_use_case entity lands.
 */

import { useRouter } from "next/navigation";
import type { AIGovAccessLevel } from "@/lib/ai-governance";
import { PROGRAMME_CODES } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
  activeProgramme: string | null;
  activeTier: string | null;
}

const PROGRAMME_DISPLAY: Record<string, string> = {
  PEGASUS:   "Pegasus Healthcare",
  PHOENIX:   "Phoenix Pharma",
  ORION:     "Orion Insurance",
  STELLAR:   "Stellar Logistics",
  HELIX:     "Helix Biotech",
  ATLAS:     "Atlas Energy",
  DRACO:     "Draco Retail",
  LYRA:      "Lyra Finance",
  VEGA:      "Vega Telecom",
  ANDROMEDA: "Andromeda Media",
};

export const AI_TIER_SLUGS: Record<string, string> = {
  "Green": "green",
  "Amber": "amber",
  "Red": "red",
  "Red Pending": "red-pending",
};

export const AI_TIER_SLUG_TO_LABEL: Record<string, string> = {
  "green": "Green",
  "amber": "Amber",
  "red": "Red",
  "red-pending": "Red Pending",
};

const AI_TIER_COLUMNS = ["Green", "Amber", "Red", "Red Pending"] as const;

export function AIGovRiskTierMatrix({ accessLevel, activeProgramme, activeTier }: Props) {
  const router = useRouter();
  const isFullAP = accessLevel === "FULL_AP";
  const footerNote = isFullAP
    ? "Counts require ai_use_case entity."
    : "Per-use-case detail requires Audit Permission. Counts require ai_use_case entity.";

  function handleCellClick(code: string, tierSlug: string) {
    const params = new URLSearchParams();
    params.set("p", code);
    params.set("tier", tierSlug);
    router.push(`/home/ai-governance?${params.toString()}`, { scroll: false });
  }

  function handleRowHeaderClick(code: string) {
    const params = new URLSearchParams();
    params.set("p", code);
    // ?tier= intentionally cleared: row header drill is programme-only
    router.push(`/home/ai-governance?${params.toString()}`, { scroll: false });
  }

  function handleColHeaderClick(tierSlug: string) {
    const params = new URLSearchParams();
    if (activeProgramme !== null) params.set("p", activeProgramme);
    params.set("tier", tierSlug);
    router.push(`/home/ai-governance?${params.toString()}`, { scroll: false });
  }

  function handleKeyActivate(e: React.KeyboardEvent, action: () => void) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }

  return (
    <div data-testid="ai-gov-risk-tier-matrix">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">AI Risk Tier Matrix</h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium" data-stub="true">
          stub
        </span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface-subtle">
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Programme
              </th>
              {AI_TIER_COLUMNS.map((tier) => {
                const slug = AI_TIER_SLUGS[tier] ?? tier;
                const isColActive = activeTier === slug;
                const isRedPending = tier === "Red Pending";
                return (
                  <th
                    key={tier}
                    className={`text-left px-4 py-3 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none transition-colors hover:text-accent-gold ${
                      isRedPending ? "border-l-4 border-accent-gold" : ""
                    } ${
                      isColActive
                        ? "text-accent-gold underline underline-offset-2"
                        : isRedPending
                          ? "text-accent-gold"
                          : "text-text-muted"
                    }`}
                    onClick={() => handleColHeaderClick(slug)}
                    onKeyDown={(e) => handleKeyActivate(e, () => handleColHeaderClick(slug))}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by AI risk tier ${tier}`}
                    data-testid={`ai-tier-col-header-${slug}`}
                  >
                    {tier}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PROGRAMME_CODES.map((code, idx) => {
              const isRowActive = activeProgramme === code;
              return (
                <tr
                  key={code}
                  className={`border-b border-border-subtle last:border-0 transition-colors ${
                    isRowActive
                      ? "bg-accent-gold/10"
                      : idx % 2 === 0
                        ? ""
                        : "bg-bg-surface-subtle/50"
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-accent-gold ${
                      isRowActive ? "text-accent-gold" : "text-text-primary"
                    }`}
                    onClick={() => handleRowHeaderClick(code)}
                    onKeyDown={(e) => handleKeyActivate(e, () => handleRowHeaderClick(code))}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by programme ${code}`}
                    data-testid={`ai-tier-row-${code}`}
                  >
                    {PROGRAMME_DISPLAY[code] ?? code}
                  </td>
                  {AI_TIER_COLUMNS.map((tier) => {
                    const slug = AI_TIER_SLUGS[tier] ?? tier;
                    const isColActive = activeTier === slug;
                    const isCellActive = isRowActive && isColActive;
                    const isRedPending = tier === "Red Pending";
                    return (
                      <td
                        key={tier}
                        className={`px-4 py-3 cursor-pointer ${isRedPending ? "border-l-4 border-accent-gold/20" : ""} ${
                          isCellActive ? "ring-accent-gold" : ""
                        }`}
                        onClick={() => handleCellClick(code, slug)}
                        onKeyDown={(e) => handleKeyActivate(e, () => handleCellClick(code, slug))}
                        role="button"
                        tabIndex={0}
                        aria-label={`${code} ${tier}: filter by programme and tier`}
                        data-testid={`ai-tier-cell-${code}-${slug}`}
                      >
                        <div
                          className={`h-7 w-12 rounded flex items-center justify-center text-text-muted font-mono text-xs hover:opacity-80 transition-opacity ${
                            isCellActive
                              ? "ring-2 ring-accent-gold ring-inset"
                              : isColActive
                                ? "ring-1 ring-accent-gold/50 ring-inset"
                                : ""
                          }`}
                          data-stub="true"
                        >
                          n/a
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong bg-bg-surface-subtle">
              <td className="px-4 py-3 text-text-primary text-xs font-semibold">
                Portfolio Total
              </td>
              {AI_TIER_COLUMNS.map((tier) => {
                const isRedPending = tier === "Red Pending";
                return (
                  <td
                    key={tier}
                    className={`px-4 py-3 text-text-muted font-mono text-xs ${isRedPending ? "border-l-4 border-accent-gold/20" : ""}`}
                    data-stub="true"
                  >
                    n/a
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-2 text-text-muted text-[11px]">{footerNote}</p>
    </div>
  );
}
