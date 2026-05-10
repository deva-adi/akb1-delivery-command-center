/**
 * Pyramid by Band panel -- REAL headcount bars, stub attrition column.
 *
 * Band counts come from buildPyramidBands (GET /api/v1/people).
 * BAND_LABELS are display-layer constants; bars are real data.
 * Attrition risk percentage per band is stub (needs attrition events entity).
 * Blended rate and leverage ratio are stub (needs financials entity).
 */

import type { BandDistribution } from "@/lib/capability";
import { BAND_LABELS, BAND_ORDER } from "@/lib/workforce";

interface Props {
  dist: BandDistribution;
}

export function WorkforcePyramid({ dist }: Props): JSX.Element {
  const maxCount = Math.max(
    ...BAND_ORDER.map((b) => dist.counts[b] ?? 0),
    1,
  );

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5 relative"
      data-testid="workforce-pyramid"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Pyramid by Band</h3>
        <span className="text-text-subtle text-xs">{dist.total} total</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Headcount left. Attrition risk right (stub: awaiting attrition entity).
      </p>

      <div className="space-y-3">
        {BAND_ORDER.map((band) => {
          const count = dist.counts[band] ?? 0;
          const pct =
            dist.total > 0
              ? ((count / dist.total) * 100).toFixed(1)
              : "0.0";
          const barWidth =
            maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
          const label = BAND_LABELS[band] ?? band;

          return (
            <div key={band} data-band={band}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-text-primary font-medium">
                  {band} {label}
                </span>
                <span className="text-text-primary font-mono tabular-nums">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="flex-1 h-4 bg-bg-surface-elevated rounded">
                  <div
                    className="h-4 bg-role-pm-soft rounded"
                    style={{ width: `${barWidth}%` }}
                    data-count={count}
                  />
                </div>
                {/* TODO: attrition % per band from attrition events entity */}
                <span
                  className="w-16 text-right text-[10px] text-text-subtle font-mono"
                  data-stub="true"
                >
                  attr --%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            Blended rate
          </div>
          {/* TODO: replace when financials entity lands */}
          <div className="text-text-subtle font-mono tabular-nums" data-stub="true">
            -- USD/hr
          </div>
        </div>
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            Leverage ratio
          </div>
          {/* TODO: replace when allocations entity lands */}
          <div className="text-text-subtle font-mono tabular-nums" data-stub="true">
            1 : --
          </div>
        </div>
      </div>
    </div>
  );
}
