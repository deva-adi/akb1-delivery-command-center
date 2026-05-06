/**
 * Margin Literacy Distribution panel -- stub.
 *
 * The wireframe shows 60-second margin test scores per DM. The current seed
 * does not populate last_1on1_sentiment_score (all NULL), and the margin
 * test is a separate entity not yet modelled.
 *
 * When last_1on1_sentiment_score is populated in the seed, the panel will
 * surface those scores under the label "1-on-1 Sentiment Score" (distinct
 * from the margin test score). The margin test itself requires a separate
 * entity per PRD 24 section 6.8.
 *
 * TODO: replace when GET /api/v1/capability/margin-literacy lands.
 */

import type { SentimentEntry } from "@/lib/capability";

interface Props {
  sentimentList: SentimentEntry[];
}

export function CapabilityMarginLiteracy({ sentimentList }: Props): JSX.Element {
  return (
    <div
      className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-stub="true"
      data-testid="capability-margin-literacy"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-text-primary text-base font-semibold">Margin Literacy per DM</h2>
        <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">60-second margin test scores</p>

      {sentimentList.length > 0 ? (
        <div className="space-y-1.5 text-xs">
          {sentimentList.map((entry) => {
            const isRed = entry.score < 60;
            const isAmber = entry.score >= 60 && entry.score < 75;
            const rowClass = isRed
              ? "bg-status-red/10"
              : isAmber
                ? "bg-status-amber/10"
                : "bg-status-green/10";
            const scoreClass = isRed
              ? "text-status-red"
              : isAmber
                ? "text-status-amber"
                : "text-status-green";

            return (
              <div
                key={entry.person_id}
                className={`flex items-center justify-between p-1.5 rounded ${rowClass}`}
                data-person-id={entry.person_id}
              >
                <span className="text-text-primary">{entry.full_name}</span>
                <span className={`font-mono font-semibold ${scoreClass}`}>
                  {entry.score}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-text-subtle text-xs text-center py-8">
          {/* TODO: margin test scores from margin_literacy entity; currently NULL in seed */}
          Margin literacy scores not yet seeded.
          Sentiment scores will populate here when last_1on1_sentiment_score
          is extended in the seed.
        </div>
      )}
    </div>
  );
}
