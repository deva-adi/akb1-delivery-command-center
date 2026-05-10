/**
 * AI Impact Pyramid Overlay panel -- stub.
 *
 * Requires ai_tool_usage entity (not yet seeded). Displays the wireframe SVG
 * pyramid with placeholder compression percentages from the wireframe.
 * Band labels from BAND_LABELS are real; percentage values are wireframe
 * illustrations only.
 * TODO: replace when GET /api/v1/workforce/pyramid/ai-overlay lands.
 */

import { BAND_LABELS } from "@/lib/workforce";

export function WorkforceAIOverlay(): JSX.Element {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="workforce-ai-overlay"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-text-primary font-semibold">AI Impact Pyramid Overlay</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-subtle text-xs">2026 vs 2024</span>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
      </div>
      <p className="text-text-muted text-xs mb-4">
        AI automation task-mix shift per band. Percentages are wireframe
        illustrations.
        {/* TODO: replace with real ai_tool_usage data */}
      </p>

      <div className="space-y-2 text-xs">
        {(
          [
            { band: "B5", delta: "-4%", isNeg: true },
            { band: "B4", delta: "+28%", isNeg: false },
            { band: "B3", delta: "-42%", isNeg: true },
            { band: "B2", delta: "-58%", isNeg: true },
            { band: "B1", delta: "-72%", isNeg: true },
          ] as const
        ).map(({ band, delta, isNeg }) => (
          <div
            key={band}
            className="grid items-center gap-2"
            style={{ gridTemplateColumns: "2rem 1fr 3.5rem" }}
          >
            <span className="text-text-muted font-mono text-[10px]">{band}</span>
            <div className="h-5 bg-bg-surface-elevated rounded overflow-hidden">
              <div
                className={`h-5 rounded ${isNeg ? "bg-status-red/30" : "bg-status-green/30"}`}
                style={{ width: "60%" }}
              />
            </div>
            <span
              className={`font-mono text-[10px] text-right ${isNeg ? "text-status-red" : "text-status-green"}`}
            >
              {delta}
            </span>
          </div>
        ))}
      </div>

      <p className="text-accent-gold text-xs mt-3">
        {BAND_LABELS["B3"]} reskill pathway flagged. Stub: awaiting ai_tool_usage entity.
      </p>
    </div>
  );
}
