/**
 * Pyramid Shift panel -- REAL current headcount, stub projection.
 *
 * Current headcount by band is derived from GET /api/v1/people via
 * buildPyramidBands. Clicking a bar sets ?band=CODE. Active band highlighted.
 * The 12-month AI-accelerated projection bars are stub (requires a separate
 * forecast entity not yet modelled).
 *
 * Bars run B5 (senior) at top down to B1 (junior) at bottom.
 */

import type { BandDistribution } from "@/lib/capability";
import { DrillRow } from "@/components/drill/DrillRow";

interface Props {
  dist: BandDistribution;
  activeProgamme: string | null;
  activeBand: string | null;
}

const BANDS = ["B5", "B4", "B3", "B2", "B1"] as const;

export function CapabilityPyramidShift({ dist, activeProgamme, activeBand }: Props): JSX.Element {
  const maxCount = Math.max(
    ...BANDS.map((b) => dist.counts[b] ?? 0),
    1,
  );

  return (
    <div
      className="col-span-4 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-testid="capability-pyramid-shift"
    >
      <h2 className="text-text-primary text-base font-semibold mb-1">
        Pyramid Shift
      </h2>
      <p className="text-text-muted text-xs mb-4">
        Click a band to filter. 12-month projection stub.
      </p>

      <div className="space-y-1 text-xs">
        {BANDS.map((band) => {
          const count = dist.counts[band] ?? 0;
          const widthPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
          const isSenior = band === "B4" || band === "B5";
          const isActive = activeBand === band;

          const href = activeProgamme
            ? `/home/capability-supply-chain?p=${activeProgamme}&band=${band}`
            : `/home/capability-supply-chain?band=${band}`;

          return (
            <DrillRow
              key={band}
              href={href}
              className={`rounded px-1 ${isActive ? "ring-2 ring-accent-gold ring-inset" : ""}`}
            >
              <div
                className="grid items-center gap-2 py-0.5"
                style={{ gridTemplateColumns: "2rem 1fr 5rem" }}
                data-band={band}
                data-testid={`capability-bar-${band}`}
              >
                <span className={`font-mono text-[10px] ${isActive ? "text-accent-gold font-semibold" : "text-text-muted"}`}>
                  {band}
                </span>
                <div className="h-5 bg-bg-surface-elevated rounded overflow-hidden">
                  <div
                    className={`h-5 rounded ${
                      isActive
                        ? "bg-accent-gold"
                        : isSenior
                          ? "bg-accent-gold/60"
                          : "bg-accent-gold/30"
                    }`}
                    style={{ width: `${widthPct}%` }}
                    data-count={count}
                  />
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-text-secondary font-mono text-[10px]">
                    {count}
                  </span>
                  <span className="text-text-subtle font-mono text-[10px]">
                    &rarr; --
                  </span>
                </div>
              </div>
            </DrillRow>
          );
        })}
      </div>

      <p className="text-[11px] text-text-subtle mt-4">
        Senior band (B4+B5): {dist.seniorCount} ({dist.seniorPct}%). Junior band (B1+B2): {dist.juniorCount}.
        Projection stub: awaiting AI-era forecast entity.
      </p>
    </div>
  );
}
