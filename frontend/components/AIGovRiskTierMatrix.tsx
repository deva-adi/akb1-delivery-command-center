/**
 * Risk Tier Matrix: 10 programmes x Green/Amber/Red/Red Pending columns.
 * Programme names are real (PROGRAMME_CODES in seed order).
 * All tier counts are stub pending ai_use_case entity.
 * Red Pending column has gold left-edge treatment (Design Foundations R4.4).
 * TODO: replace stub counts with actuals when ai_use_case entity lands.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";
import { PROGRAMME_CODES } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

const PROGRAMME_DISPLAY: Record<string, string> = {
  PEGASUS: "Pegasus Healthcare",
  PHOENIX: "Phoenix Pharma",
  ORION: "Orion Insurance",
  STELLAR: "Stellar Logistics",
  HELIX: "Helix Biotech",
  ATLAS: "Atlas Energy",
  DRACO: "Draco Retail",
  LYRA: "Lyra Finance",
  VEGA: "Vega Telecom",
  ANDROMEDA: "Andromeda Media",
};

export function AIGovRiskTierMatrix({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";
  const footerNote = isFullAP
    ? "Counts require ai_use_case entity."
    : "Per-use-case detail requires Audit Permission. Counts require ai_use_case entity.";

  return (
    <div data-testid="ai-gov-risk-tier-matrix">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">AI Risk Tier Matrix</h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium" data-stub="true">
          stub
        </span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface-subtle">
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Programme
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Green
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Amber
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Red
              </th>
              {/* Gold left-edge treatment per Design Foundations R4.4 */}
              <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider font-medium border-l-4 border-accent-gold text-accent-gold">
                Red Pending
              </th>
            </tr>
          </thead>
          <tbody>
            {PROGRAMME_CODES.map((code, idx) => (
              <tr
                key={code}
                className={`border-b border-border-subtle last:border-0 ${
                  idx % 2 === 0 ? "" : "bg-bg-surface-subtle/50"
                }`}
              >
                <td className="px-4 py-3 text-text-primary font-medium">
                  {PROGRAMME_DISPLAY[code] ?? code}
                </td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                  {/* TODO: replace with actuals when ai_use_case entity lands */}
                  n/a
                </td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                  n/a
                </td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                  n/a
                </td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs border-l-4 border-accent-gold/20" data-stub="true">
                  n/a
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong bg-bg-surface-subtle">
              <td className="px-4 py-3 text-text-primary text-xs font-semibold">
                Portfolio Total
              </td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">n/a</td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">n/a</td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">n/a</td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs border-l-4 border-accent-gold/20" data-stub="true">n/a</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-2 text-text-muted text-[11px]">{footerNote}</p>
    </div>
  );
}
