import type { HeatMapRow, RaidSeverity } from "@/lib/raids";

interface Props {
  rows: HeatMapRow[];
}

function cellClass(severity: RaidSeverity, count: number): string {
  if (count === 0) {
    return "bg-bg-base text-text-subtle";
  }
  switch (severity) {
    case "Critical":
      return "bg-status-red text-white";
    case "High":
      return "bg-status-amber text-bg-base";
    case "Medium":
      return "bg-border-strong/60 text-text-primary";
    case "Low":
      return "bg-border-subtle/60 text-text-muted";
  }
}

const TOTALS_INITIAL = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };

function sumRows(rows: HeatMapRow[]) {
  return rows.reduce(
    (acc, r) => ({
      critical: acc.critical + r.critical,
      high: acc.high + r.high,
      medium: acc.medium + r.medium,
      low: acc.low + r.low,
      total: acc.total + r.total,
    }),
    TOTALS_INITIAL,
  );
}

export function RaidHeatMap({ rows }: Props) {
  const totals = sumRows(rows);

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="raid-heat-map"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">RAID Heat Map</h3>
        <span className="text-text-subtle text-xs">Programme x Severity (open items only)</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Count of Open and Escalated RAID items per programme.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]" data-testid="heat-map-table">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-text-muted font-medium">Programme</th>
              <th className="py-2 px-2 text-status-red font-medium text-center">Critical</th>
              <th className="py-2 px-2 text-status-amber font-medium text-center">High</th>
              <th className="py-2 px-2 text-text-muted font-medium text-center">Medium</th>
              <th className="py-2 px-2 text-text-muted font-medium text-center">Low</th>
              <th className="py-2 px-2 text-text-muted font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.programmeCode}
                className="hover:bg-border-subtle/40 transition cursor-pointer"
                data-testid={`heat-map-row-${row.programmeCode}`}
              >
                <td className="py-1.5 pr-3 text-text-primary font-medium">
                  {row.programmeCode}
                </td>
                {(
                  [
                    ["Critical", row.critical],
                    ["High", row.high],
                    ["Medium", row.medium],
                    ["Low", row.low],
                  ] as [RaidSeverity, number][]
                ).map(([sev, count]) => (
                  <td key={sev} className="py-1.5 px-2">
                    <div
                      className={`h-6 rounded font-mono font-bold tabular flex items-center justify-center ${cellClass(sev, count)}`}
                      data-testid={`cell-${row.programmeCode}-${sev}`}
                    >
                      {count}
                    </div>
                  </td>
                ))}
                <td className="py-1.5 px-2 text-right text-text-primary font-mono tabular font-semibold">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-subtle">
              <td className="pt-2 pr-3 text-text-muted text-[10px] uppercase tracking-wider">
                Portfolio total
              </td>
              <td className="pt-2 px-2 text-center text-status-red font-mono tabular font-semibold">
                {totals.critical}
              </td>
              <td className="pt-2 px-2 text-center text-status-amber font-mono tabular font-semibold">
                {totals.high}
              </td>
              <td className="pt-2 px-2 text-center text-text-muted font-mono tabular">
                {totals.medium}
              </td>
              <td className="pt-2 px-2 text-center text-text-muted font-mono tabular">
                {totals.low}
              </td>
              <td className="pt-2 px-2 text-right text-text-primary font-mono tabular font-bold">
                {totals.total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
