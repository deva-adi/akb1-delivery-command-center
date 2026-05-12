"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DrillRow } from "@/components/drill/DrillRow";
import { buildDrillUrl } from "@/lib/drill";
import type { ProgrammeStateRow, ProgrammeStateDisplay } from "@/lib/executive";

interface Props {
  rows: ProgrammeStateRow[];
  activeProgamme: string | null;
  activeHealth: string | null;
}

interface DisplayConfig {
  label: string;
  dotClass: string;
  textClass: string;
  rowClass: string;
  activeClass: string;
}

function displayConfig(state: ProgrammeStateDisplay): DisplayConfig {
  switch (state) {
    case "GREEN":
      return {
        label: "GREEN",
        dotClass: "bg-status-green",
        textClass: "text-status-green",
        rowClass: "bg-status-green/5 border border-status-green/20",
        activeClass: "bg-status-green/10 border-2 border-status-green/60",
      };
    case "AMBER":
      return {
        label: "AMBER",
        dotClass: "bg-status-amber",
        textClass: "text-status-amber",
        rowClass: "bg-status-amber/5 border border-status-amber/20",
        activeClass: "bg-status-amber/10 border-2 border-status-amber/60",
      };
    case "RED":
      return {
        label: "RED",
        dotClass: "bg-status-red",
        textClass: "text-status-red",
        rowClass: "bg-status-red/5 border border-status-red/20",
        activeClass: "bg-status-red/10 border-2 border-status-red/60",
      };
    case "BREACH":
      return {
        label: "BREACH",
        dotClass: "bg-status-red",
        textClass: "text-status-red font-bold",
        rowClass: "bg-status-red/10 border border-status-red/40",
        activeClass: "bg-status-red/15 border-2 border-status-red/80",
      };
  }
}

const RAG_FOR_DISPLAY: Record<ProgrammeStateDisplay, string> = {
  GREEN: "Green",
  AMBER: "Amber",
  RED: "Red",
  BREACH: "Failing",
};

export function ExecutiveProgrammeStateList({ rows, activeProgamme, activeHealth }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function healthChipHref(display: ProgrammeStateDisplay): string {
    const rag = RAG_FOR_DISPLAY[display];
    const next = new URLSearchParams({ health: rag });
    return `${pathname}?${next.toString()}`;
  }

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="executive-programme-state-list"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Programme State</h3>
        <span className="text-text-subtle text-xs">{rows.length} programme{rows.length !== 1 ? "s" : ""}</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Latest health snapshot per programme. Click a row to drill in.
      </p>

      {(activeProgamme !== null || activeHealth !== null) && (
        <div className="mb-3">
          <Link
            href={pathname}
            className="text-xs text-text-muted hover:text-text-primary underline underline-offset-2"
          >
            Show all programmes
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-subtle text-sm">
          No health data for this filter.
        </div>
      ) : (
        <div className="space-y-2" data-testid="programme-state-rows">
          {rows.map((row) => {
            const cfg = displayConfig(row.display);
            const isActive = activeProgamme === row.programmeCode;
            const drillHref = buildDrillUrl(pathname, { p: row.programmeCode });
            const dhWithCode = `/home/delivery-health?p=${row.programmeCode}`;
            const raidWithCode = `/home/risk-raid?p=${row.programmeCode}`;

            return (
              <div key={row.programmeCode} data-testid={`programme-state-row-${row.programmeCode}`}>
                <DrillRow
                  href={drillHref}
                  className={`flex items-center justify-between p-2 rounded ${isActive ? cfg.activeClass : cfg.rowClass}`}
                >
                  <span className="text-text-primary text-xs font-medium">
                    {row.programmeCode}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Filter by ${cfg.label} health`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(healthChipHref(row.display), { scroll: false });
                      }}
                      className={`flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 hover:opacity-80 transition-opacity ${cfg.textClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                      {cfg.label}
                    </button>
                  </div>
                </DrillRow>

                {isActive && (
                  <div className="flex items-center gap-3 mt-1 px-2 pb-1">
                    <Link
                      href={dhWithCode}
                      className="text-[10px] text-text-muted hover:text-accent-gold transition-colors"
                      data-testid={`exec-dh-link-${row.programmeCode}`}
                    >
                      View Delivery Health
                    </Link>
                    <Link
                      href={raidWithCode}
                      className="text-[10px] text-text-muted hover:text-accent-gold transition-colors"
                      data-testid={`exec-raid-link-${row.programmeCode}`}
                    >
                      View RAID
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
