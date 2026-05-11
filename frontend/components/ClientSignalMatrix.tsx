/**
 * Signal matrix table: 10 programmes x signal columns.
 *
 * Real columns: Programme name, State (from buildClientHealthProxy RAG proxy).
 * All signal columns and Composite are stubs pending client_signals entity.
 * TODO: replace stub columns with actuals when client_signals entity lands.
 */

import type { ProgrammeClientState, ClientHealthWhat } from "@/lib/client-health";

interface Props {
  states: ProgrammeClientState[];
  intel: ClientHealthWhat;
}

const STATE_COLOUR: Record<string, string> = {
  INTERVENE: "text-status-red font-semibold",
  WATCH: "text-status-amber font-semibold",
  HEALTHY: "text-status-green font-semibold",
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

export function ClientSignalMatrix({ states, intel }: Props) {
  return (
    <div data-testid="client-signal-matrix">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">Client Signal Matrix</h3>
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
                Client
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Escalations 90d
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Missed Exec Mtgs
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Ticket Age
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Last NPS
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Value Realisation
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Composite
              </th>
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                State
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
                  {/* TODO: replace with actuals when clients entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when client_signals entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when client_signals entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when client_signals entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when client_signals entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with actuals when value_realisation entity lands */}
                  n/a
                </td>
                <td
                  className="px-4 py-3 text-text-muted font-mono text-xs"
                  data-stub="true"
                >
                  {/* TODO: replace with composite signal score when client_signals entity lands */}
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
              <td className="px-4 py-3 text-text-primary text-xs font-semibold" colSpan={7}>
                Portfolio Blended Score
              </td>
              <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                n/a
              </td>
              <td className="px-4 py-3">
                <span className="text-text-primary font-semibold font-mono text-sm">
                  {intel.blendedScore !== null ? `${intel.blendedScore}/100` : "n/a"}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-2 text-text-muted text-[11px]">
        Signal data requires client_signals entity. State derived from health snapshot RAG proxy.
      </p>
    </div>
  );
}
