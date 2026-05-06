/**
 * Pyramid Shift panel -- REAL current headcount, stub projection.
 *
 * Current headcount by band is derived from GET /api/v1/people via
 * buildPyramidBands. The 12-month AI-accelerated projection bars are
 * stub (requires a separate forecast entity not yet modelled).
 *
 * Bars run B5 (senior) at top down to B1 (junior) at bottom, matching
 * the wireframe layout convention.
 */

import type { BandDistribution } from "@/lib/capability";

interface Props {
  dist: BandDistribution;
}

const BANDS = ["B5", "B4", "B3", "B2", "B1"] as const;

export function CapabilityPyramidShift({ dist }: Props): JSX.Element {
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
        Current headcount. 12-month projection stub.
      </p>

      <div className="space-y-2 text-xs">
        {BANDS.map((band) => {
          const count = dist.counts[band] ?? 0;
          const widthPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
          const isSenior = band === "B4" || band === "B5";

          return (
            <div
              key={band}
              className="grid items-center gap-2"
              style={{ gridTemplateColumns: "2rem 1fr 5rem" }}
              data-band={band}
            >
              <span className="text-text-muted font-mono text-[10px]">{band}</span>
              <div className="h-5 bg-bg-surface-elevated rounded overflow-hidden">
                <div
                  className={`h-5 rounded ${isSenior ? "bg-accent-gold/60" : "bg-accent-gold/30"}`}
                  style={{ width: `${widthPct}%` }}
                  data-count={count}
                />
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-text-secondary font-mono text-[10px]">
                  {count}
                </span>
                <span className="text-text-subtle font-mono text-[10px]">
                  {/* TODO: projected count from forecast entity */}
                  &rarr; --
                </span>
              </div>
            </div>
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
