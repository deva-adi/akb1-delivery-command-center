"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { buildDrillUrl } from "@/lib/drill";
import type { ProgrammeFinancialState, FinancialState } from "@/lib/financials";
import { PROGRAMME_CODES } from "@/lib/raids";

const HEALTH_PARAM_TO_STATES: Record<string, FinancialState[]> = {
  Red: ["RED", "BREACH"],
  Amber: ["AMBER"],
  Watching: ["AMBER"],
  Green: ["GREEN"],
  Failing: ["BREACH"],
};

interface Props {
  allStates: ProgrammeFinancialState[];
  activeProgamme: string | null;
  activeHealth: string | null;
}

function stateChipStyle(state: FinancialState): string {
  if (state === "BREACH") return "bg-status-red/10 border border-status-red/40 text-status-red font-bold";
  if (state === "RED") return "bg-status-red/10 border border-status-red/40 text-status-red";
  if (state === "AMBER") return "bg-status-amber/10 border border-status-amber/40 text-status-amber";
  return "bg-status-green/10 border border-status-green/40 text-status-green";
}

const FINANCIAL_STATE_TO_RAG: Record<FinancialState, string> = {
  BREACH: "Failing",
  RED: "Red",
  AMBER: "Amber",
  GREEN: "Green",
};

function stateMap(states: ProgrammeFinancialState[]): Map<string, FinancialState> {
  return new Map(states.map((s) => [s.programmeCode, s.state]));
}

export function FinancialsProgrammeTable({ allStates, activeProgamme, activeHealth }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const map = stateMap(allStates);

  const healthStates =
    activeHealth !== null ? (HEALTH_PARAM_TO_STATES[activeHealth] ?? null) : null;

  const displayCodes = PROGRAMME_CODES.filter((c) => {
    if (activeProgamme !== null) return c === activeProgamme;
    if (healthStates !== null) return healthStates.includes(map.get(c) ?? "GREEN");
    return true;
  });

  function handleRowClick(code: string) {
    router.push(buildDrillUrl(pathname, { p: code }), { scroll: false });
  }

  function handleRowKey(e: React.KeyboardEvent, code: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(buildDrillUrl(pathname, { p: code }), { scroll: false });
    }
  }

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="financials-programme-table"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Revenue by Programme</h3>
        <span className="text-text-subtle text-xs">
          MTD | {displayCodes.length} programme{displayCodes.length !== 1 ? "s" : ""} | revenue figures stub
          {activeProgamme !== null && (
            <Link
              href={pathname}
              className="ml-3 text-text-muted hover:text-text-primary underline underline-offset-2"
            >
              Show all
            </Link>
          )}
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        State column derived from health snapshot RAG. All dollar figures pending
        financials_monthly entity. Click a row to drill in.
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
            <th className="text-right pb-3 font-medium w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {displayCodes.map((code) => {
            const state = map.get(code) ?? "GREEN";
            const isActive = activeProgamme === code;
            const ragParam = FINANCIAL_STATE_TO_RAG[state];

            return (
              <tr
                key={code}
                role="button"
                tabIndex={0}
                aria-label={`Drill into ${code} financials`}
                onClick={() => handleRowClick(code)}
                onKeyDown={(e) => handleRowKey(e, code)}
                className={`cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-inset ${
                  isActive
                    ? "bg-accent-gold/5 border-l-2 border-l-accent-gold"
                    : "hover:bg-bg-surface-subtle/50"
                }`}
              >
                <td
                  className={`py-2.5 text-text-primary font-medium ${isActive ? "text-accent-gold" : ""}`}
                  data-testid={`financials-row-${code}`}
                >
                  {code}
                  {isActive && (
                    <span className="ml-2 text-[9px] text-accent-gold font-normal">selected</span>
                  )}
                </td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">n/a</td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    aria-label={`Filter by ${state} financial state`}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`${pathname}?health=${ragParam}`, { scroll: false });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] ${stateChipStyle(state)}`}
                  >
                    {state}
                  </button>
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/home/delivery-health?p=${code}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-text-muted hover:text-accent-gold transition-colors whitespace-nowrap"
                    data-testid={`financials-dh-link-${code}`}
                  >
                    View DH
                  </Link>
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
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
