/**
 * Intelligence card for the AI Governance tab.
 * Renders different What text by access level.
 * Why/Act are static and only rendered for FULL_AP.
 * Tab subtitle visible at all access levels.
 * data-stub="true" on all wireframe value sections.
 * TODO: replace wireframe values with ai_use_case + ai_quality_gate entities when seeded.
 */

import type { AIGovAccessLevel } from "@/lib/ai-governance";

interface Props {
  accessLevel: AIGovAccessLevel;
}

export function AIGovIntelligenceCard({ accessLevel }: Props) {
  const isFullAP = accessLevel === "FULL_AP";
  const isCadenceOnly = accessLevel === "CADENCE_ONLY";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="ai-gov-intelligence-card"
    >
      <p className="text-text-muted text-xs mb-4 font-medium tracking-wide uppercase">
        AI governance is distinct from AI adoption.
      </p>

      <div className={`grid gap-8 ${isFullAP ? "grid-cols-3" : "grid-cols-1"}`}>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What does this tell me
            </h3>
          </div>

          {isFullAP && (
            <p className="text-text-secondary text-sm leading-relaxed" data-stub="true">
              {/* TODO: replace with ai_use_case + ai_quality_gate entities when seeded */}
              <span className="text-status-red font-semibold">
                200 AI use cases across 10 programmes. 20 classified Red, of which 8 are
                Pending approval.
              </span>{" "}
              <span className="text-status-amber font-semibold">
                Shadow IT survey this quarter discovered 5 previously undisclosed tools on
                Phoenix and Helix.
              </span>{" "}
              <span className="text-text-primary font-semibold">
                Quality gate pass rate 88 percent, below 95 target.
              </span>
            </p>
          )}

          {isCadenceOnly && (
            <p className="text-text-secondary text-sm leading-relaxed">
              AI Governance Cadence view. Finance Lead access scoped to governance reporting.
            </p>
          )}

          {!isFullAP && !isCadenceOnly && (
            <p className="text-text-secondary text-sm leading-relaxed" data-stub="true">
              {/* TODO: replace with ai_use_case entity when seeded */}
              Aggregate AI governance view. Audit Permission required to view per-use-case
              detail.{" "}
              <span className="text-text-muted text-xs">
                Aggregate KPI summary: 200 use cases, 20 Red, 88% gate pass rate.
              </span>
            </p>
          )}
        </div>

        {isFullAP && (
          <div className="pl-8 border-l border-border-subtle">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
              <h3 className="text-accent-gold text-base font-semibold tracking-tight">
                Why is this happening
              </h3>
            </div>
            <ol className="space-y-2 text-sm">
              <li className="flex items-baseline gap-3">
                <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                  1
                </span>
                <span className="text-text-secondary">
                  Pending Red cases lack bias assessments. Teams are shipping AI features
                  without completing the mandatory governance checklist, creating undisclosed
                  risk in the portfolio.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                  2
                </span>
                <span className="text-text-secondary">
                  Shadow tools surfaced through survey rather than proactive governance.
                  The quarterly survey is the backstop, not the first line. Tools are
                  deployed before the register is updated.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                  3
                </span>
                <span className="text-text-secondary">
                  Quality gate drift on Helix: two stale approvals have not been
                  re-validated after scope changes. Gates were passed once but the
                  underlying use case changed significantly since.
                </span>
              </li>
            </ol>
          </div>
        )}

        {isFullAP && (
          <div className="pl-8 border-l border-border-subtle">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
              <h3 className="text-accent-gold text-base font-semibold tracking-tight">
                What do I do this week
              </h3>
            </div>
            <div className="space-y-2">
              <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
                <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                  Assign bias assessments to all 8 Pending Red use cases before next
                  approval window.
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-text-muted">Portfolio Owner</span>
                  <span className="text-status-red font-medium">This week</span>
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
                <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                  Move Shadow Survey cadence from quarterly to monthly to reduce
                  undisclosed tool lag.
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-text-muted">Delivery Director</span>
                  <span className="text-status-amber font-medium">This week</span>
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
                <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                  Re-validate the 2 stale Helix quality gates against current scope
                  before they block the next milestone.
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-text-muted">Programme Manager</span>
                  <span className="text-status-amber font-medium">This week</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
