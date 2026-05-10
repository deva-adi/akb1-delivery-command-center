import type { ProgrammeFinancialState, FinancialState } from "@/lib/financials";
import { PROGRAMME_CODES } from "@/lib/raids";

interface Props {
  states: ProgrammeFinancialState[];
}

function stateChipStyle(state: FinancialState): string {
  if (state === "BREACH") return "bg-status-red/10 border border-status-red/40 text-status-red font-bold";
  if (state === "RED") return "bg-status-red/10 border border-status-red/40 text-status-red";
  if (state === "AMBER") return "bg-status-amber/10 border border-status-amber/40 text-status-amber";
  return "bg-status-green/10 border border-status-green/40 text-status-green";
}

function stateMap(states: ProgrammeFinancialState[]): Map<string, FinancialState> {
  return new Map(states.map((s) => [s.programmeCode, s.state]));
}

export function FinancialsProgrammeTable({ states }: Props) {
  const map = stateMap(states);

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="financials-programme-table"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Revenue by Programme</h3>
        <span className="text-text-subtle text-xs">
          MTD | {PROGRAMME_CODES.length} programmes | revenue figures stub
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        State column derived from health snapshot RAG. All dollar figures pending
        financials_monthly entity.
        {/* TODO: replace Booked/Billed/Collected/DSO/Margin with actuals when financials_monthly lands */}
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
            <th className="text-left pb-3 font-medium">Programme</th>
            <th className="text-right pb-3 font-medium">
              Booked
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">
              Billed
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">
              Collected
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">
              DSO
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">
              Margin
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">State</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {PROGRAMME_CODES.map((code) => {
            const state = map.get(code) ?? "GREEN";
            return (
              <tr
                key={code}
                className="hover:bg-bg-surface-subtle/50 transition cursor-pointer"
              >
                <td className="py-2.5 text-text-primary font-medium">{code}</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${stateChipStyle(state)}`}>
                    {state}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border-strong">
            <td className="pt-3 text-text-primary font-semibold">Portfolio total</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
