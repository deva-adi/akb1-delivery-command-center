/**
 * Cadence Calendar -- programme x week grid stub.
 * TODO: replace with real data when cadences table lands.
 */

type CadenceType = "Theatre" | "Daily" | "Weekly" | "Steerco";

interface Cell {
  type: CadenceType;
}

function cadenceClass(type: CadenceType): string {
  switch (type) {
    case "Theatre":
      return "bg-status-red/40 border-status-red text-status-red";
    case "Weekly":
      return "bg-status-amber/30 border-status-amber text-status-amber";
    case "Steerco":
      return "bg-status-green/30 border-status-green text-status-green";
    default:
      return "bg-status-green/30 border-status-green text-status-green";
  }
}

const WEEKS = ["W14", "W15", "W16", "W17", "W18", "W19", "W20", "W21", "W22"];

const CADENCE_DATA: { programme: string; cells: Cell[] }[] = [
  {
    programme: "Pegasus",
    cells: [
      { type: "Theatre" }, { type: "Daily" }, { type: "Daily" }, { type: "Weekly" },
      { type: "Theatre" }, { type: "Daily" }, { type: "Weekly" }, { type: "Steerco" }, { type: "Daily" },
    ],
  },
  {
    programme: "Phoenix",
    cells: [
      { type: "Daily" }, { type: "Daily" }, { type: "Weekly" }, { type: "Daily" },
      { type: "Theatre" }, { type: "Daily" }, { type: "Weekly" }, { type: "Steerco" }, { type: "Daily" },
    ],
  },
  {
    programme: "Orion",
    cells: [
      { type: "Daily" }, { type: "Daily" }, { type: "Weekly" }, { type: "Daily" },
      { type: "Daily" }, { type: "Daily" }, { type: "Weekly" }, { type: "Steerco" }, { type: "Daily" },
    ],
  },
  {
    programme: "Stellar",
    cells: [
      { type: "Daily" }, { type: "Weekly" }, { type: "Daily" }, { type: "Daily" },
      { type: "Daily" }, { type: "Weekly" }, { type: "Daily" }, { type: "Steerco" }, { type: "Daily" },
    ],
  },
  {
    programme: "Helix",
    cells: [
      { type: "Daily" }, { type: "Daily" }, { type: "Weekly" }, { type: "Daily" },
      { type: "Daily" }, { type: "Daily" }, { type: "Weekly" }, { type: "Steerco" }, { type: "Daily" },
    ],
  },
];

export function GovCadenceCalendar() {
  return (
    <div
      className="col-span-7 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-testid="gov-cadence-calendar"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary text-base font-semibold">Cadence Calendar</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Rows are programmes. Columns are weeks of Q2 2026.
          </p>
        </div>
        <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">
          stub -- cadences table pending
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted">
              <th className="text-left p-2 font-medium">Programme</th>
              {WEEKS.map((w) => (
                <th key={w} className="text-center p-1 font-mono font-normal">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CADENCE_DATA.map((row) => (
              <tr key={row.programme} className="border-t border-border-subtle">
                <td className="p-2 text-text-primary font-medium">{row.programme}</td>
                {row.cells.map((cell, i) => (
                  <td key={i} className="p-1">
                    <div
                      className={`w-full h-6 border rounded text-[10px] flex items-center justify-center ${cadenceClass(cell.type)}`}
                    >
                      {cell.type}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-status-green/30 border border-status-green rounded" />
          Healthy
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-status-amber/30 border border-status-amber rounded" />
          At Risk
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-status-red/40 border border-status-red rounded" />
          Theatre
        </div>
      </div>
    </div>
  );
}
