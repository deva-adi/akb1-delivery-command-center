/**
 * Stakeholder Influence Map (stub) + Over-Optimism Portfolio (real data) +
 * Escalation Timing (stub).
 */

import type { OverOptimismRow } from "@/lib/governance";

interface Props {
  overOptimismRows: OverOptimismRow[];
}

export function GovStakeholderSection({ overOptimismRows }: Props) {
  const flaggedRows = overOptimismRows.filter((r) => r.flagged);
  const displayed = overOptimismRows.slice(0, 6);

  return (
    <section
      className="grid grid-cols-12 gap-6 mb-8"
      data-testid="gov-stakeholder-section"
    >

      <div className="col-span-5 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Stakeholder Influence Map</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">stub</span>
        </div>
        <div className="relative bg-bg-surface-subtle border border-border-subtle rounded aspect-video p-3">
          <div className="absolute top-1 left-1/2 text-[9px] text-text-subtle -translate-x-1/2">High Support</div>
          <div className="absolute bottom-1 left-1/2 text-[9px] text-text-subtle -translate-x-1/2">Opposing</div>
          <div className="absolute left-1 top-1/2 text-[9px] text-text-subtle -translate-y-1/2">Low Influence</div>
          <div className="absolute right-1 top-1/2 text-[9px] text-text-subtle -translate-y-1/2">High Influence</div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-subtle" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border-subtle" />
          <div className="absolute w-5 h-5 rounded-full bg-status-green/60 border-2 border-status-green" style={{ top: "18%", right: "14%" }} />
          <div className="absolute w-4 h-4 rounded-full bg-status-green/60 border-2 border-status-green" style={{ top: "25%", right: "28%" }} />
          <div className="absolute w-3 h-3 rounded-full bg-status-amber/60 border-2 border-status-amber" style={{ top: "42%", right: "32%" }} />
          <div className="absolute w-6 h-6 rounded-full bg-status-red/60 border-2 border-status-red" style={{ bottom: "18%", right: "18%" }} />
          <div className="absolute w-3 h-3 rounded-full bg-status-red/60 border-2 border-status-red" style={{ bottom: "30%", left: "38%" }} />
          <div className="absolute w-3 h-3 rounded-full bg-status-green/60 border-2 border-status-green" style={{ top: "35%", left: "30%" }} />
          <div className="absolute w-4 h-4 rounded-full bg-status-amber/60 border-2 border-status-amber" style={{ bottom: "40%", right: "45%" }} />
        </div>
        <div className="mt-2 text-[11px] text-text-muted">Size = decision maker. 2 opposing decision-makers flagged.</div>
        <div className="mt-1 text-[9px] text-text-subtle">TODO: replace when stakeholders table lands</div>
      </div>

      <div className="col-span-4 bg-bg-surface border border-border-subtle rounded-md p-5" data-testid="gov-over-optimism">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Over-Optimism Portfolio</h2>
        </div>
        <div className="text-text-muted text-[11px] mb-3">
          Green-on-green flag:{" "}
          <span className={flaggedRows.length > 0 ? "text-status-red font-semibold" : "text-status-green font-semibold"}>
            {flaggedRows.length} programme{flaggedRows.length !== 1 ? "s" : ""}
          </span>{" "}
          reporting green while carrying delayed milestones.
        </div>
        {displayed.length === 0 ? (
          <div className="text-text-subtle text-sm py-4 text-center">No health data in scope.</div>
        ) : (
          <div className="space-y-2">
            {displayed.map((row) => (
              <div
                key={row.programmeCode}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  row.flagged ? "bg-status-red/10" : ""
                }`}
                data-testid={`over-optimism-row-${row.programmeCode}`}
              >
                <span className="text-text-primary">{row.programmeCode}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-text-muted">
                    {row.greenSnapshotCount} green period{row.greenSnapshotCount !== 1 ? "s" : ""}
                  </span>
                  {row.flagged ? (
                    <span
                      className="px-1.5 py-0.5 bg-status-red/30 text-status-red rounded text-[10px]"
                      data-testid={`flagged-badge-${row.programmeCode}`}
                    >
                      Flagged
                    </span>
                  ) : (
                    <span
                      className="px-1.5 py-0.5 bg-status-green/20 text-status-green rounded text-[10px]"
                      data-testid={`ok-badge-${row.programmeCode}`}
                    >
                      OK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Escalation Timing</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">stub</span>
        </div>
        <div className="text-text-muted text-[11px] mb-3">
          Distribution across 30 RAIDs with escalation.
        </div>
        <div className="space-y-2 text-xs">
          {[
            { label: "Early", count: 8, color: "status-green" },
            { label: "OnTime", count: 12, color: "status-green" },
            { label: "Late", count: 8, color: "status-red" },
            { label: "NeverEscalated", count: 2, color: "status-red" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-primary">{item.label}</span>
                <span className={`font-mono text-${item.color}`}>{item.count}</span>
              </div>
              <div className="w-full h-2 bg-border-subtle rounded">
                <div
                  className={`h-2 bg-${item.color} rounded`}
                  style={{ width: `${Math.round((item.count / 30) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[9px] text-text-subtle">
          TODO: replace when decision history timestamps land
        </div>
      </div>

    </section>
  );
}
