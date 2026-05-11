/**
 * Pending Red-tier backlog panel for AI Governance tab.
 * Non-FULL_AP: blocked with inline AP-required message.
 * FULL_AP: 5 static rows from wireframe + "View all 8" stub button +
 *          approval aging histogram stub.
 * TODO: replace with actuals when ai_use_case + ai_quality_gate entities land.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

const PENDING_ROWS = [
  { programme: "Phoenix",  useCase: "Customer response",  classification: "Restricted",    gates: 3, ageDays: 42, owner: "Rajiv",  riskFlag: "Schedule bias" },
  { programme: "Phoenix",  useCase: "Customer response",  classification: "Restricted",    gates: 3, ageDays: 38, owner: "Rajiv",  riskFlag: "Schedule bias" },
  { programme: "Helix",    useCase: "Clinical decision",  classification: "Restricted",    gates: 3, ageDays: 35, owner: "Priya",  riskFlag: "Schedule bias" },
  { programme: "Phoenix",  useCase: "Customer response",  classification: "Confidential",  gates: 2, ageDays: 28, owner: "Kiran",  riskFlag: "Schedule bias" },
  { programme: "Pegasus",  useCase: "Code authoring",     classification: "Internal",      gates: 2, ageDays: 21, owner: "Meera",  riskFlag: "Schedule bias" },
] as const;

function ageColour(days: number): string {
  if (days > 30) return "text-status-red font-semibold";
  if (days > 14) return "text-status-amber font-semibold";
  return "text-status-green";
}

export function AIGovPendingBacklog({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";

  return (
    <div data-testid="ai-gov-pending-backlog">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">
          Pending Red-Tier Backlog
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium" data-stub="true">
          stub
        </span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden" data-stub="true">
        {!isFullAP ? (
          <div className="px-6 py-8 text-center">
            <p className="text-text-muted text-sm">
              Audit Permission required to view pending Red-tier backlog.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface-subtle">
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Programme</th>
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Use Case</th>
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Classification</th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Gates</th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Pending Days</th>
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Owner</th>
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">Risk Flag</th>
                </tr>
              </thead>
              <tbody>
                {PENDING_ROWS.map((row, idx) => (
                  <tr
                    key={`${row.programme}-${idx}`}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">{row.programme}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.useCase}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.classification}</td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary text-xs">{row.gates}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs ${ageColour(row.ageDays)}`}>
                      {row.ageDays}d
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.owner}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-status-amber/10 border border-status-amber/20 rounded text-[10px] text-status-amber font-medium">
                        {row.riskFlag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between">
              <p className="text-text-muted text-[11px]">
                Showing 5 of 8. All have schedule bias risk flags.
              </p>
              <button
                type="button"
                className="text-xs text-text-secondary border border-border-subtle rounded px-3 py-1 hover:border-border-strong transition"
                data-stub="true"
              >
                {/* TODO: wire to ai_use_case pending-backlog endpoint when entity lands */}
                View all 8
              </button>
            </div>

            {/* Approval aging histogram stub */}
            <div className="px-4 py-3 border-t border-border-subtle bg-bg-surface-subtle" data-stub="true">
              <p className="text-text-muted text-[11px] mb-2 font-medium uppercase tracking-wide">
                Approval Aging Distribution (stub)
              </p>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-status-green/60" />
                  <span className="text-text-muted">Under 14d</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-status-amber/60" />
                  <span className="text-text-muted">14-30d</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-status-red/60" />
                  <span className="text-text-muted">Above 30d</span>
                </span>
              </div>
              <div className="mt-2 w-full h-6 bg-bg-surface rounded overflow-hidden flex">
                {/* Placeholder bar shell proportional to wireframe (stub) */}
                <div className="h-6 bg-status-green/40" style={{ width: "25%" }} />
                <div className="h-6 bg-status-amber/40" style={{ width: "37%" }} />
                <div className="h-6 bg-status-red/40" style={{ width: "38%" }} />
              </div>
              <p className="mt-1 text-text-muted text-[10px]">
                {/* TODO: replace with actuals when ai_use_case entity lands */}
                Stub proportions. Live aging requires ai_use_case + ai_quality_gate entities.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
