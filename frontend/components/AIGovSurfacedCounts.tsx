/**
 * Surfaced count badges for AI Governance tab.
 * Four alert badges: Pending Red, Pending human-in-loop, Red without bias
 * assessment, and Cadence reports overdue.
 * All stub pending ai_use_case entity.
 * Non-FULL_AP: badges visible, no drill links.
 * TODO: replace with actuals when ai_use_case entity lands.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

const BADGES = [
  {
    label: "Pending Red",
    count: 8,
    bg: "bg-status-red/10",
    border: "border-status-red/30",
    text: "text-status-red",
  },
  {
    label: "Pending human-in-loop",
    count: 17,
    bg: "bg-status-amber/10",
    border: "border-status-amber/30",
    text: "text-status-amber",
  },
  {
    label: "Red without bias assessment",
    count: 8,
    bg: "bg-status-red/10",
    border: "border-status-red/30",
    text: "text-status-red",
  },
  {
    label: "Cadence reports overdue",
    count: 0,
    bg: "bg-status-green/10",
    border: "border-status-green/30",
    text: "text-status-green",
  },
] as const;

export function AIGovSurfacedCounts({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";

  return (
    <div
      className="flex flex-wrap gap-4"
      data-testid="ai-gov-surfaced-counts"
      data-stub="true"
    >
      {/* TODO: replace with actuals when ai_use_case entity lands */}
      {BADGES.map((b) => (
        <div
          key={b.label}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${b.bg} ${b.border} min-w-[200px]`}
        >
          <span className={`${b.text} text-3xl font-semibold font-mono tabular`}>
            {b.count}
          </span>
          <div>
            <p className="text-text-primary text-sm font-medium leading-tight">{b.label}</p>
            {!isFullAP && (
              <p className="text-text-muted text-[10px] mt-0.5">no drill (AP required)</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
