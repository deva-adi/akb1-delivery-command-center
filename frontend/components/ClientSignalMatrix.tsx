"use client";

/**
 * Signal matrix table: 10 programmes x signal columns.
 *
 * Click a row         -> sets ?p=CODE, preserves ?signal= if active
 * Click a col header  -> sets ?signal=SLUG, preserves ?p= if active
 *
 * activeProgramme and activeSignal come from client-health/page.tsx (server
 * searchParams). useRouter is used for navigation; useSearchParams is NOT
 * used to avoid requiring a Suspense boundary.
 *
 * Real columns: Programme name, State (from buildClientHealthProxy RAG proxy).
 * All signal columns and Composite are stubs pending client_signals entity.
 * TODO: replace stub columns with actuals when client_signals entity lands.
 */

import { useRouter } from "next/navigation";
import type { ProgrammeClientState, ClientHealthWhat } from "@/lib/client-health";

interface Props {
  states: ProgrammeClientState[];
  intel: ClientHealthWhat;
  activeProgramme: string | null;
  activeSignal: string | null;
}

const STATE_COLOUR: Record<string, string> = {
  INTERVENE: "text-status-red font-semibold",
  WATCH: "text-status-amber font-semibold",
  HEALTHY: "text-status-green font-semibold",
};

const PROGRAMME_DISPLAY: Record<string, string> = {
  PEGASUS:   "Pegasus Healthcare",
  PHOENIX:   "Phoenix Pharma",
  ORION:     "Orion Insurance",
  STELLAR:   "Stellar Logistics",
  HELIX:     "Helix Biotech",
  ATLAS:     "Atlas Energy",
  DRACO:     "Draco Retail",
  LYRA:      "Lyra Finance",
  VEGA:      "Vega Telecom",
  ANDROMEDA: "Andromeda Media",
};

export const SIGNAL_SLUGS: Record<string, string> = {
  "Escalations 90d": "escalations-90d",
  "Missed Exec Mtgs": "missed-exec-mtgs",
  "Ticket Age": "ticket-age",
  "Last NPS": "last-nps",
  "Value Realisation": "value-realisation",
  "Composite": "composite",
};

export const SIGNAL_SLUG_TO_LABEL: Record<string, string> = {
  "escalations-90d": "Escalations 90d",
  "missed-exec-mtgs": "Missed Exec Mtgs",
  "ticket-age": "Ticket Age",
  "last-nps": "Last NPS",
  "value-realisation": "Value Realisation",
  "composite": "Composite",
};

const SIGNAL_COLUMNS = [
  "Escalations 90d",
  "Missed Exec Mtgs",
  "Ticket Age",
  "Last NPS",
  "Value Realisation",
  "Composite",
] as const;

export function ClientSignalMatrix({ states, intel, activeProgramme, activeSignal }: Props) {
  const router = useRouter();

  function handleRowClick(code: string) {
    const params = new URLSearchParams();
    params.set("p", code);
    if (activeSignal !== null) params.set("signal", activeSignal);
    router.push(`/home/client-health?${params.toString()}`, { scroll: false });
  }

  function handleColHeaderClick(signalSlug: string) {
    const params = new URLSearchParams();
    if (activeProgramme !== null) params.set("p", activeProgramme);
    params.set("signal", signalSlug);
    router.push(`/home/client-health?${params.toString()}`, { scroll: false });
  }

  function handleKeyActivate(e: React.KeyboardEvent, action: () => void) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }

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
              {SIGNAL_COLUMNS.map((col) => {
                const slug = SIGNAL_SLUGS[col] ?? col;
                const isColActive = activeSignal === slug;
                return (
                  <th
                    key={col}
                    className={`text-left px-4 py-3 text-[11px] uppercase tracking-wider font-medium cursor-pointer select-none transition-colors hover:text-accent-gold ${
                      isColActive
                        ? "text-accent-gold underline underline-offset-2"
                        : "text-text-muted"
                    }`}
                    onClick={() => handleColHeaderClick(slug)}
                    onKeyDown={(e) => handleKeyActivate(e, () => handleColHeaderClick(slug))}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by signal ${col}`}
                    data-testid={`signal-col-header-${slug}`}
                  >
                    {col}
                  </th>
                );
              })}
              <th className="text-left px-4 py-3 text-text-muted text-[11px] uppercase tracking-wider font-medium">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {states.map((row, idx) => {
              const isRowActive = activeProgramme === row.code;
              return (
                <tr
                  key={row.code}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter by programme ${row.code}`}
                  onClick={() => handleRowClick(row.code)}
                  onKeyDown={(e) => handleKeyActivate(e, () => handleRowClick(row.code))}
                  className={`border-b border-border-subtle last:border-0 cursor-pointer transition-colors ${
                    isRowActive
                      ? "bg-accent-gold/10"
                      : idx % 2 === 0
                        ? "hover:bg-bg-surface-elevated"
                        : "bg-bg-surface-subtle/50 hover:bg-bg-surface-elevated"
                  }`}
                  data-testid={`signal-row-${row.code}`}
                >
                  <td className={`px-4 py-3 font-medium ${isRowActive ? "text-accent-gold" : "text-text-primary"}`}>
                    {PROGRAMME_DISPLAY[row.code] ?? row.code}
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when clients entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when client_signals entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when client_signals entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when client_signals entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when client_signals entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with actuals when value_realisation entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs" data-stub="true">
                    {/* TODO: replace with composite signal score when client_signals entity lands */}
                    n/a
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATE_COLOUR[row.state] ?? "text-text-secondary"}>
                      {row.state}
                    </span>
                  </td>
                </tr>
              );
            })}
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
