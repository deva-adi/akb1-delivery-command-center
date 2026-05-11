/**
 * Quality Gates panel for the AI Governance tab.
 * Three tier rows from wireframe with stub counts.
 * Non-FULL_AP: blocked with inline AP-required message (panel visible but content locked).
 * TODO: replace stub values with actuals when ai_quality_gate entity lands.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

const GATE_ROWS = [
  {
    tier: "Green",
    rule: "0-1 gate / use case",
    total: 130,
    passed: 128,
    failed: 0,
    waived: 2,
    failedAlert: false,
    waivedAlert: true,
  },
  {
    tier: "Amber",
    rule: "1-2 gates / use case",
    total: 85,
    passed: 74,
    failed: 4,
    waived: 7,
    failedAlert: false,
    waivedAlert: true,
  },
  {
    tier: "Red",
    rule: "3 mandatory",
    total: 60,
    passed: 32,
    failed: 6,
    waived: 0,
    failedAlert: true,
    waivedAlert: false,
  },
] as const;

const TIER_COLOUR: Record<string, string> = {
  Green: "text-status-green",
  Amber: "text-status-amber",
  Red: "text-status-red",
};

export function AIGovQualityGates({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";

  return (
    <div data-testid="ai-gov-quality-gates">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">Quality Gate Status</h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium" data-stub="true">
          stub
        </span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden" data-stub="true">
        {!isFullAP ? (
          <div className="px-6 py-8 text-center">
            <p className="text-text-muted text-sm">
              Audit Permission required to view quality gate detail.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface-subtle">
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Tier
                  </th>
                  <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Rule
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Total
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Passed
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Failed
                  </th>
                  <th className="text-right px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                    Waived
                  </th>
                </tr>
              </thead>
              <tbody>
                {GATE_ROWS.map((row) => (
                  <tr key={row.tier} className="border-b border-border-subtle last:border-0">
                    <td className={`px-4 py-3 font-semibold ${TIER_COLOUR[row.tier] ?? "text-text-primary"}`}>
                      {row.tier}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{row.rule}</td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">{row.total}</td>
                    <td className="px-4 py-3 text-right font-mono text-status-green">{row.passed}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${row.failedAlert ? "text-status-red" : "text-text-secondary"}`}>
                      {row.failed}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${row.waivedAlert ? "text-status-amber" : "text-text-secondary"}`}>
                      {row.waived}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-2 text-text-muted text-[11px] border-t border-border-subtle">
              {/* TODO: replace stub values with actuals when ai_quality_gate entity lands */}
              Stub values from wireframe. Live gate counts require ai_quality_gate entity.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
