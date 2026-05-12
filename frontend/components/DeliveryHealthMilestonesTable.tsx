"use client";

import { useRouter } from "next/navigation";
import type { SlippingMilestone, MilestoneStatus } from "@/lib/delivery-health";

interface Props {
  milestones: SlippingMilestone[];
  activeProgamme: string | null;
}

function statusBadge(status: MilestoneStatus): { label: string; classes: string } {
  switch (status) {
    case "Delayed":
      return {
        label: "Delayed",
        classes: "bg-status-red/20 text-status-red border-status-red/40",
      };
    case "At Risk":
      return {
        label: "At Risk",
        classes: "bg-status-amber/20 text-status-amber border-status-amber/40",
      };
    case "Complete":
      return {
        label: "Complete",
        classes: "bg-status-green/20 text-status-green border-status-green/40",
      };
    default:
      return {
        label: status,
        classes: "bg-border-subtle/40 text-text-muted border-border-subtle",
      };
  }
}

function slipLabel(slipDays: number): string {
  if (slipDays === 0) return "Future";
  return `${slipDays}d`;
}

function slipColor(slipDays: number, status: MilestoneStatus): string {
  if (slipDays > 14 || status === "Delayed") return "text-status-red font-mono tabular";
  if (slipDays > 7 || status === "At Risk") return "text-status-amber font-mono tabular";
  return "text-text-muted font-mono tabular";
}

export function DeliveryHealthMilestonesTable({ milestones, activeProgamme }: Props) {
  const router = useRouter();

  function handleRowClick(m: SlippingMilestone) {
    router.push(
      `/home/delivery-health/${m.programmeCode}/${m.milestoneId}`,
      { scroll: false },
    );
  }

  function handleRowKey(e: React.KeyboardEvent, m: SlippingMilestone) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick(m);
    }
  }

  const heading = activeProgamme
    ? `Milestones: ${activeProgamme}`
    : "Top 5 Slipping Milestones";
  const subheading = activeProgamme
    ? "All milestones for this programme. Click a row to view detail."
    : "At Risk and Delayed milestones only. Drill to programme detail for recovery plan.";

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="delivery-health-milestones-table"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">{heading}</h3>
        <span className="text-text-subtle text-xs">Ranked by days past plan</span>
      </div>
      <p className="text-text-muted text-xs mb-4">{subheading}</p>

      {milestones.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-text-subtle text-sm">
          No slipping milestones detected.
        </div>
      ) : (
        <table className="w-full text-sm" data-testid="milestones-table">
          <thead>
            <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
              <th className="text-left pb-3 font-medium">Milestone</th>
              <th className="text-left pb-3 font-medium">Programme</th>
              <th className="text-left pb-3 font-medium">Due</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-right pb-3 font-medium">Complete</th>
              <th className="text-right pb-3 font-medium">Slip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {milestones.map((m) => {
              const badge = statusBadge(m.status);
              return (
                <tr
                  key={m.milestoneId}
                  role="button"
                  tabIndex={0}
                  aria-label={`View milestone: ${m.title}`}
                  onClick={() => handleRowClick(m)}
                  onKeyDown={(e) => handleRowKey(e, m)}
                  className="hover:bg-border-subtle/20 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-inset"
                  data-testid={`milestone-row-${m.milestoneId}`}
                >
                  <td className="py-3 text-text-primary">{m.title}</td>
                  <td className="py-3 text-text-secondary">{m.programmeCode}</td>
                  <td className="py-3 text-text-muted font-mono tabular text-xs">
                    {m.dueDate}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 text-right text-text-secondary font-mono tabular text-xs">
                    {m.completionPct}%
                  </td>
                  <td
                    className={`py-3 text-right text-xs ${slipColor(m.slipDays, m.status)}`}
                  >
                    {slipLabel(m.slipDays)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
