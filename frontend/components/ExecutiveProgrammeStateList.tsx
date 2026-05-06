import type { ProgrammeStateRow, ProgrammeStateDisplay } from "@/lib/executive";

interface Props {
  rows: ProgrammeStateRow[];
}

interface DisplayConfig {
  label: string;
  dotClass: string;
  textClass: string;
  rowClass: string;
}

function displayConfig(state: ProgrammeStateDisplay): DisplayConfig {
  switch (state) {
    case "GREEN":
      return {
        label: "GREEN",
        dotClass: "bg-status-green",
        textClass: "text-status-green",
        rowClass: "bg-status-green/5 border border-status-green/20",
      };
    case "AMBER":
      return {
        label: "AMBER",
        dotClass: "bg-status-amber",
        textClass: "text-status-amber",
        rowClass: "bg-status-amber/5 border border-status-amber/20",
      };
    case "RED":
      return {
        label: "RED",
        dotClass: "bg-status-red",
        textClass: "text-status-red",
        rowClass: "bg-status-red/5 border border-status-red/20",
      };
    case "BREACH":
      return {
        label: "BREACH",
        dotClass: "bg-status-red",
        textClass: "text-status-red font-bold",
        rowClass: "bg-status-red/10 border border-status-red/40",
      };
  }
}

export function ExecutiveProgrammeStateList({ rows }: Props) {
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
        Latest health snapshot per programme.
      </p>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-subtle text-sm">
          No health data available.
        </div>
      ) : (
        <div className="space-y-2" data-testid="programme-state-rows">
          {rows.map((row) => {
            const cfg = displayConfig(row.display);
            return (
              <div
                key={row.programmeCode}
                className={`flex items-center justify-between p-2 rounded ${cfg.rowClass}`}
                data-testid={`programme-state-row-${row.programmeCode}`}
              >
                <span className="text-text-primary text-xs font-medium">
                  {row.programmeCode}
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                  <span className={cfg.textClass}>{cfg.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
