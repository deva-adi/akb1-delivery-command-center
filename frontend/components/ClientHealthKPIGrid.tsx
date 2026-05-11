/**
 * Five KPI cards for the Client Health tab.
 *
 * KPI 1 (Portfolio Health) and KPI 2 (Below Threshold) are real proxies from
 * health snapshot RAG. KPIs 3-5 are stubs pending client_signals entity.
 * TODO: replace stubs with actuals when client_signals entity lands.
 */

import type { ClientHealthWhat } from "@/lib/client-health";

interface Props {
  intel: ClientHealthWhat;
}

function scoreColour(score: number | null): string {
  if (score === null) return "text-text-muted";
  if (score >= 65) return "text-status-green";
  if (score >= 50) return "text-status-amber";
  return "text-status-red";
}

export function ClientHealthKPIGrid({ intel }: Props) {
  const scoreClass = scoreColour(intel.blendedScore);
  const scoreDisplay = intel.blendedScore !== null ? String(intel.blendedScore) : "n/a";

  return (
    <div className="grid grid-cols-5 gap-4" data-testid="client-health-kpi-grid">

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Portfolio Health
        </div>
        <div className={`${scoreClass} text-4xl font-semibold font-mono tabular`}>
          {scoreDisplay}
          {intel.blendedScore !== null && (
            <span className="text-xl text-text-muted">/100</span>
          )}
        </div>
        <div className="mt-2 text-xs text-text-subtle">target 65</div>
      </div>

      <div
        className={`bg-bg-surface border rounded-lg p-5 ${
          intel.interveneCount > 0
            ? "border-status-red/40 bg-status-red/5"
            : "border-border-subtle"
        }`}
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Programmes in INTERVENE
        </div>
        <div
          className={`text-4xl font-semibold font-mono tabular ${
            intel.interveneCount > 0 ? "text-status-red" : "text-status-green"
          }`}
        >
          {intel.interveneCount}
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {intel.interveneCount > 0 ? "above threshold" : "within threshold"}
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Escalations 90d
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          27
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when client_signals entity lands */}
          pending client_signals
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Missed Exec Meetings
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          7
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when client_signals entity lands */}
          pending client_signals
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Last Formal NPS
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          54
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when client_signals entity lands */}
          pending client_signals
        </div>
      </div>

    </div>
  );
}
