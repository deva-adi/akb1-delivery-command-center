/**
 * Workforce Intelligence intelligence card.
 *
 * What: derived from real people data (total headcount, band distribution).
 * Why + Act: static, matching wireframe operational HR voice.
 */

import type { WorkforceWhat } from "@/lib/workforce";

interface Props {
  intel: WorkforceWhat;
}

export function WorkforceIntelligenceCard({ intel }: Props): JSX.Element {
  const whatParts = [
    `${intel.totalHeadcount} people across 5 bands (${intel.bandLine}).`,
    intel.seniorLine,
    intel.overtimeLine ?? "Overtime hours not yet seeded.",
    intel.sentimentLine ?? "1-on-1 sentiment scores not yet seeded.",
    "Utilisation, attrition, and team sustainability data pending operational workforce entities.",
  ];

  return (
    <section className="border-b border-border-subtle bg-bg-surface-subtle">
      <div className="max-w-[1440px] mx-auto px-8 py-6 grid grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What does this tell me
            </h3>
          </div>
          <p
            className="text-text-secondary text-sm leading-relaxed"
            data-testid="workforce-what"
          >
            {whatParts.join(" ")}
          </p>
        </div>

        <div className="pl-8 border-l border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              Why is this happening
            </h3>
          </div>
          <ol className="space-y-2 text-sm">
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">40%</span>
              <span className="text-text-secondary">
                B2 engineers leaving for competitor counter-offers in the Hyderabad tech market.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">35%</span>
              <span className="text-text-secondary">
                Orion attrition concentrated on two B4 Senior Managers leaving this month.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">25%</span>
              <span className="text-text-secondary">
                Phoenix needs regulatory compliance skills but current team has general platform engineers.
              </span>
            </li>
          </ol>
        </div>

        <div className="pl-8 border-l border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What do I do this week
            </h3>
          </div>
          <div className="space-y-2">
            {[
              "Launch B2 retention campaign with targeted counter-offers in Hyderabad.",
              "Promote two internal B3 Tech Leads to B4 to backfill Orion gap.",
              "Pull two compliance specialists from Vega to Phoenix on 60-day detail.",
            ].map((action) => (
              <div
                key={action}
                className="bg-bg-surface border border-border-subtle rounded-md p-3"
              >
                <p className="text-text-primary text-sm font-medium leading-snug">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
