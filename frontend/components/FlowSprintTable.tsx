import type { SprintWindowRow } from "@/lib/flow-velocity";
import type { HealthSnapshotItem } from "@/lib/delivery-health";

interface Props {
  rows: SprintWindowRow[];
  healthByProgramme: Record<string, HealthSnapshotItem[]>;
}

const TREND_ARROW: Record<"up" | "flat" | "down", string> = {
  up: "up up",
  flat: "flat",
  down: "down down",
};

function trendColour(trend: "up" | "flat" | "down"): string {
  if (trend === "up") return "text-status-green";
  if (trend === "down") return "text-status-red";
  return "text-text-muted";
}

function latestRAG(snapshots: HealthSnapshotItem[]): string {
  if (snapshots.length === 0) return "text-text-muted";
  const sorted = [...snapshots].sort((a, b) =>
    b.snapshot_date.localeCompare(a.snapshot_date),
  );
  const rag = sorted[0]?.overall_rag ?? "Green";
  if (rag === "Red" || rag === "Failing") return "text-status-red";
  if (rag === "Amber" || rag === "Watching") return "text-status-amber";
  return "text-status-green";
}

export function FlowSprintTable({ rows, healthByProgramme }: Props) {
  if (rows.length === 0) {
    return (
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="flow-sprint-table"
      >
        <h3 className="text-text-primary font-semibold mb-4">Sprint Performance</h3>
        <p className="text-text-muted text-sm">No milestone data available.</p>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      w1: acc.w1 + r.window1,
      w2: acc.w2 + r.window2,
      w3: acc.w3 + r.window3,
    }),
    { w1: 0, w2: 0, w3: 0 },
  );

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="flow-sprint-table"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Sprint Performance</h3>
        <span className="text-text-subtle text-xs">
          Programme x last 3 monthly windows (milestone proxy)
          {/* TODO: replace with actuals when sprint_velocity_log endpoint lands */}
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Completed milestone count per period as velocity proxy. Cycle time and flow efficiency
        require sprint story data.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
            <th className="text-left pb-3 font-medium">Programme</th>
            <th className="text-right pb-3 font-medium">Window 1</th>
            <th className="text-right pb-3 font-medium">Window 2</th>
            <th className="text-right pb-3 font-medium">Window 3</th>
            <th className="text-right pb-3 font-medium">
              Cycle Time
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">
              Flow Eff.
              <span className="ml-1 text-[9px] text-text-subtle normal-case">stub</span>
            </th>
            <th className="text-right pb-3 font-medium">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {rows.map((row) => {
            const snapshots = healthByProgramme[row.programmeCode] ?? [];
            const ragColour = latestRAG(snapshots);
            const trendCol = trendColour(row.trend);
            return (
              <tr
                key={row.programmeCode}
                className="hover:bg-bg-surface-subtle/50 transition cursor-pointer"
              >
                <td className={`py-2.5 font-medium ${ragColour}`}>{row.programmeCode}</td>
                <td className="py-2.5 text-right text-text-primary font-mono tabular">
                  {row.window1}
                </td>
                <td className="py-2.5 text-right text-text-primary font-mono tabular">
                  {row.window2}
                </td>
                <td className="py-2.5 text-right text-text-primary font-mono tabular font-semibold">
                  {row.window3}
                </td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">
                  n/a
                </td>
                <td className="py-2.5 text-right text-text-subtle font-mono tabular text-xs">
                  n/a
                </td>
                <td className={`py-2.5 text-right font-mono tabular font-semibold ${trendCol}`}>
                  {TREND_ARROW[row.trend]}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border-strong">
            <td className="pt-3 text-text-primary font-semibold">Portfolio</td>
            <td className="pt-3 text-right text-text-primary font-mono tabular font-bold">
              {totals.w1}
            </td>
            <td className="pt-3 text-right text-text-primary font-mono tabular font-bold">
              {totals.w2}
            </td>
            <td className="pt-3 text-right text-text-primary font-mono tabular font-bold">
              {totals.w3}
            </td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle text-xs">n/a</td>
            <td className="pt-3 text-right text-text-subtle font-mono">--</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
