/**
 * Backlog programme table.
 * Real columns: Programme name, Health state (from buildBacklogProxy).
 * All backlog-specific columns are stubs pending backlog_items entity.
 * TODO: replace stub columns with actuals when backlog_items entity lands.
 */

import type { ProgrammeBacklogState } from "@/lib/backlog-health";

interface Props {
  states: ProgrammeBacklogState[];
}

const STATE_COLOUR: Record<string, string> = {
  CRITICAL: "text-status-red font-semibold",
  RED: "text-status-red font-semibold",
  AMBER: "text-status-amber font-semibold",
  GREEN: "text-status-green font-semibold",
};

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

export function BacklogProgrammeTable({ states }: Props) {
  return (
    <div data-testid="backlog-programme-table">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">
          Backlog Health by Programme
        </h3>
        <span className="text-text-muted text-xs font-mono">
          {states.length} programme{states.length !== 1 ? "s" : ""}
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
                Total Items
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Epics
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Stories
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Ready
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Aging over 60d
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                DoR %
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Groom Last Sprint
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Health
              </th>
            </tr>
          </thead>
          <tbody>
            {states.map((row, idx) => (
              <tr
                key={row.code}
                className={`border-b border-border-subtle last:border-0 ${
                  idx % 2 === 0 ? "" : "bg-bg-surface-subtle/50"
                }`}
              >
                <td className="px-4 py-3 text-text-primary font-medium">
                  {PROGRAMME_DISPLAY[row.code] ?? row.code}
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items dor-compliance endpoint lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when backlog_items entity lands */}
                  n/a
                </td>
                <td className="px-4 py-3">
                  <span className={STATE_COLOUR[row.state] ?? "text-text-secondary"}>
                    {row.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-strong bg-bg-surface-subtle">
              <td className="px-4 py-3 text-text-primary text-xs font-semibold">
                Portfolio Total
              </td>
              <td
                className="px-4 py-3 text-text-muted font-mono text-xs"
                colSpan={7}
                data-stub="true"
              >
                {/* TODO: replace with actuals when backlog_items entity lands */}
                n/a pending backlog_items
              </td>
              <td className="px-4 py-3 text-text-primary text-xs font-semibold">
                {states.length} programmes
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 flex-wrap">
        <p className="text-text-muted text-[11px]">
          Backlog data requires backlog_items entity. Health derived from programme health
          snapshot RAG.
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-text-muted">Related tabs:</span>
          <a
            href="/home/flow-velocity"
            className="text-text-secondary underline underline-offset-2 hover:text-text-primary transition"
          >
            Flow and Velocity
          </a>
          <span className="text-border-strong">|</span>
          <span className="text-text-muted">
            Scenario Planner (not yet routed)
          </span>
        </div>
      </div>
    </div>
  );
}
