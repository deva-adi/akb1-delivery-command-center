/**
 * Four KPI cards for the AI Governance tab.
 * All four are stubs pending ai_use_case, ai_quality_gate, ai_shadow_survey,
 * and ai_delivery_speed_gap entities.
 * Non-FULL_AP: cards visible, drill links replaced with AP-required inline text.
 * TODO: replace stubs with actuals when respective ai_* entities land.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

const AP_NOTE = "Audit Permission required";

export function AIGovKPIGrid({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";

  return (
    <div className="grid grid-cols-4 gap-4" data-testid="ai-gov-kpi-grid">

      <div className="bg-bg-surface border border-status-red/30 rounded-lg p-5" data-stub="true">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          AI Risk Red Count
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-red text-4xl font-semibold font-mono tabular">
          20
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when ai_use_case entity lands */}
          target 0
        </div>
        {!isFullAP && (
          <p className="mt-1 text-[10px] text-text-muted">{AP_NOTE}</p>
        )}
      </div>

      <div className="bg-bg-surface border border-status-amber/30 rounded-lg p-5" data-stub="true">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Quality Gate Pass Rate
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          88<span className="text-xl text-text-muted">%</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when ai_quality_gate entity lands */}
          target 95%
        </div>
        {!isFullAP && (
          <p className="mt-1 text-[10px] text-text-muted">{AP_NOTE}</p>
        )}
      </div>

      <div className="bg-bg-surface border border-status-amber/30 rounded-lg p-5" data-stub="true">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Shadow Discovery Q4
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          5
          <span className="text-xl text-text-muted"> tools</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when ai_shadow_survey entity lands */}
          target less than 3
        </div>
        {!isFullAP && (
          <p className="mt-1 text-[10px] text-text-muted">{AP_NOTE}</p>
        )}
      </div>

      <div className="bg-bg-surface border border-status-amber/30 rounded-lg p-5" data-stub="true">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Delivery Speed Gap
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-status-amber text-4xl font-semibold font-mono tabular">
          18
          <span className="text-xl text-text-muted"> pts</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          {/* TODO: replace with actuals when ai_delivery_speed_gap entity lands */}
          target less than 10
        </div>
        {!isFullAP && (
          <p className="mt-1 text-[10px] text-text-muted">{AP_NOTE}</p>
        )}
      </div>

    </div>
  );
}
