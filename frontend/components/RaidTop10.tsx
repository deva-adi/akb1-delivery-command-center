import type { Top10Row } from "@/lib/raids";

interface Props {
  items: Top10Row[];
}

function severityChip(severity: "Critical" | "High") {
  return (
    <span
      className={`px-2 py-0.5 border rounded text-[10px] font-semibold ${
        severity === "Critical"
          ? "bg-status-red/10 border-status-red/40 text-status-red"
          : "bg-status-amber/10 border-status-amber/40 text-status-amber"
      }`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function ownerLabel(userId: string | null): string {
  if (userId === null) return "Unassigned";
  return userId.slice(0, 8).toUpperCase();
}

export function RaidTop10({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <h3 className="text-text-primary font-semibold mb-2">Top 10 High-Severity Risks</h3>
        <p className="text-text-muted text-sm">No open Critical or High severity RAID items.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Top 10 High-Severity Risks</h3>
        <span className="text-text-subtle text-xs">Severity desc, then last updated</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Open and Escalated Critical and High items only.
      </p>

      <table className="w-full text-sm" data-testid="raid-top10-table">
        <thead>
          <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
            <th className="text-left pb-3 font-medium">Risk title</th>
            <th className="text-left pb-3 font-medium">Programme</th>
            <th className="text-left pb-3 font-medium">Type</th>
            <th className="text-left pb-3 font-medium">Owner</th>
            <th className="text-right pb-3 font-medium">Status</th>
            <th className="text-right pb-3 font-medium">Severity</th>
            <th className="text-right pb-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {items.map((item) => (
            <tr
              key={item.raidId}
              className="hover:bg-border-subtle/30 transition cursor-pointer"
              data-testid={`top10-row-${item.raidId}`}
            >
              <td className="py-3 text-text-primary pr-4">{item.title}</td>
              <td className="py-3 text-text-secondary">{item.programmeCode}</td>
              <td className="py-3 text-text-muted">{item.raidType}</td>
              <td className="py-3 text-text-muted font-mono text-[11px]">
                {ownerLabel(item.ownerUserId)}
              </td>
              <td className="py-3 text-right">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    item.status === "Escalated"
                      ? "bg-status-red/10 text-status-red"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-3 text-right">
                {severityChip(item.severity as "Critical" | "High")}
              </td>
              <td className="py-3 text-right text-text-muted font-mono tabular text-xs">
                {formatDate(item.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
