import type { SLAMatrixRow, SLACellState } from "@/lib/ops-sla";
import { SLA_CATEGORIES } from "@/lib/ops-sla";

interface Props {
  rows: SLAMatrixRow[];
}

function cellStyle(state: SLACellState): string {
  if (state === "BREACH") return "bg-status-red text-bg-base font-bold";
  if (state === "RED") return "bg-status-red/70 text-bg-base";
  if (state === "AMBER") return "bg-status-amber text-bg-base";
  return "bg-status-green text-bg-base";
}

export function OpsSLAMatrix({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="ops-sla-matrix"
      >
        <h3 className="text-text-primary font-semibold mb-4">SLA Status Matrix</h3>
        <p className="text-text-muted text-sm">No programme health data available.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="ops-sla-matrix"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">SLA Status Matrix</h3>
        <span className="text-text-subtle text-xs">
          {rows.length} programmes x 6 SLA categories (health proxy)
          {/* TODO: replace with sla_metrics entity when seeded */}
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Derived from health snapshot sub-RAGs. Cells show BREACH when overall RAG is Failing, RED
        when Red, AMBER when Amber or Watching, GREEN otherwise.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left py-2 pr-3 font-medium">Programme</th>
              {SLA_CATEGORIES.map((cat) => (
                <th key={cat} className="py-2 px-1 text-center font-medium">
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.programmeCode}
                className="hover:bg-bg-surface-subtle/50 transition cursor-pointer"
              >
                <td className="py-1.5 pr-3 text-text-primary font-semibold">
                  {row.programmeCode}
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.category} className="py-1.5 px-1">
                    <div
                      className={`h-7 rounded flex items-center justify-center text-[10px] font-mono tabular ${cellStyle(cell.state)}`}
                    >
                      {cell.state}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
