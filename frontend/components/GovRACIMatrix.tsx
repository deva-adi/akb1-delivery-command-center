/**
 * RACI Working Matrix stub -- Pegasus programme sample.
 * TODO: replace with real data when raci_activities table lands.
 */

type RACIValue = "R" | "A" | "C" | "I" | null;

interface RACIRow {
  activity: string;
  gap?: boolean;
  overlap?: boolean;
  cells: [RACIValue, RACIValue, RACIValue, RACIValue, RACIValue, RACIValue];
}

const ROLES = ["DM", "PD", "PO", "SP", "FL", "VD"];

const ROWS: RACIRow[] = [
  { activity: "Sprint planning", cells: ["A", "R", "C", null, "I", "I"] },
  { activity: "Vendor A to B handoff", gap: true, cells: [null, null, null, null, "I", null] },
  { activity: "Defect escalation", overlap: true, cells: ["A", "A", "C", null, null, "R"] },
  { activity: "Steerco decisions", cells: ["C", "C", "A", "R", "I", null] },
];

function cellStyle(value: RACIValue): string {
  switch (value) {
    case "A": return "bg-accent-gold/20 text-accent-gold";
    case "R": return "bg-[#60A5FA]/20 text-[#60A5FA]";
    case "C": return "bg-border-strong/40 text-text-muted";
    case "I": return "bg-border-strong/40 text-text-muted";
    default: return "";
  }
}

export function GovRACIMatrix() {
  return (
    <div
      className="col-span-5 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-testid="gov-raci-matrix"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary text-base font-semibold">RACI Working Matrix</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Pegasus. 3 red gaps, 2 amber overlaps across 60 activities.
          </p>
        </div>
        <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">
          stub
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="grid grid-cols-[1fr_repeat(6,2rem)] gap-1 items-center text-[10px] text-text-muted uppercase tracking-wider">
          <div>Activity</div>
          {ROLES.map((r) => <div key={r} className="text-center">{r}</div>)}
        </div>
        {ROWS.map((row, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-[1fr_repeat(6,2rem)] gap-1 items-center text-[11px] border-t border-border-subtle pt-1.5 ${
              row.gap ? "bg-status-red/10 -mx-1 px-1 rounded" : row.overlap ? "bg-status-amber/10 -mx-1 px-1 rounded" : ""
            }`}
          >
            <div className="text-text-primary flex items-center gap-1">
              {row.activity}
              {row.gap && <span className="text-status-red text-[9px] font-semibold">GAP</span>}
              {row.overlap && <span className="text-status-amber text-[9px] font-semibold">OVERLAP</span>}
            </div>
            {row.cells.map((cell, i) => (
              <div key={i} className={`h-6 rounded flex items-center justify-center font-mono font-semibold ${cellStyle(cell)}`}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="mt-3 text-accent-gold text-xs hover:underline cursor-pointer">
        View all 60 activities (pending)
      </button>
    </div>
  );
}
