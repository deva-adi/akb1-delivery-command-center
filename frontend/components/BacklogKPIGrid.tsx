/**
 * Five KPI cards for the Backlog Health tab.
 *
 * KPI 5 (Groom Missed) is a real proxy: count of programmes with delayed
 * milestones as grooming pressure signal.
 * KPIs 1-4 are stubs pending backlog_items entity.
 * TODO: replace stubs with actuals when backlog_items entity lands.
 */

import type { BacklogWhat } from "@/lib/backlog-health";

interface Props {
  what: BacklogWhat;
}

function groomColour(count: number): string {
  if (count === 0) return "text-status-green";
  if (count < 3) return "text-status-amber";
  return "text-status-red";
}

export function BacklogKPIGrid({ what }: Props) {
  const groomClass = groomColour(what.pressureProgrammes);

  return (
    <div className="grid grid-cols-5 gap-4" data-testid="backlog-kpi-grid">

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Total Backlog
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular">
          1,847
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when backlog_items entity lands */}
          pending backlog_items
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Aging Over 60 Days
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          312
          <span className="text-xl text-text-muted"> (17%)</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when backlog_items entity lands */}
          pending backlog_items
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          DoR Compliance
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          68<span className="text-xl text-text-muted">%</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when backlog_items entity lands */}
          target 85%
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Epic Readiness
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          7.1<span className="text-xl text-text-muted">/10</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when backlog_items entity lands */}
          pending backlog_items
        </div>
      </div>

      <div
        className={`bg-bg-surface border rounded-lg p-5 ${
          what.pressureProgrammes >= 3
            ? "border-status-red/40 bg-status-red/5"
            : what.pressureProgrammes >= 1
              ? "border-status-amber/40"
              : "border-border-subtle"
        }`}
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Groom Missed
        </div>
        <div className={`${groomClass} text-4xl font-semibold font-mono tabular`}>
          {what.pressureProgrammes}
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          programmes with delayed milestones{" "}
          {what.pressureProgrammes > 0 ? "| above threshold" : "| target 0"}
        </div>
      </div>

    </div>
  );
}
