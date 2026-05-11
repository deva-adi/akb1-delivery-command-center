/**
 * AI Governance Cadence section.
 * Uses CADENCE_ROWS static constant (no AP gating, no entity dependency).
 * Accessible to any allowed role including FL (CADENCE_ONLY access level).
 * Last report date cells are stub pending ai_governance_cadence entity.
 * TODO: replace last report date stubs when ai_governance_cadence entity lands.
 */

import { CADENCE_ROWS, type CadenceStatus } from "@/lib/ai-governance";

const STATUS_COLOUR: Record<CadenceStatus, string> = {
  OnTime: "text-status-green bg-status-green/10 border-status-green/20",
  Slipping: "text-status-amber bg-status-amber/10 border-status-amber/20",
  Missed: "text-status-red bg-status-red/10 border-status-red/20",
};

const STATUS_LABEL: Record<CadenceStatus, string> = {
  OnTime: "On Time",
  Slipping: "Slipping",
  Missed: "Missed",
};

export function AIGovCadence() {
  return (
    <div data-testid="ai-gov-cadence">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">
          Governance Cadence
        </h3>
        <span className="text-text-muted text-xs font-mono">4 scheduled cadences</span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface-subtle">
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Cadence
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Next Report Date
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Last Report Date
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {CADENCE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-border-subtle last:border-0">
                <td className="px-4 py-3 text-text-primary font-medium">{row.label}</td>
                <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                  {row.nextDate}
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when ai_governance_cadence entity lands */}
                  n/a
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded border text-[11px] font-medium ${STATUS_COLOUR[row.status]}`}
                  >
                    {STATUS_LABEL[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
