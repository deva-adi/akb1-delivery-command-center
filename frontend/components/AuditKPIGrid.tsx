/**
 * Audit Trail Console KPI row.
 *
 * Five operational KPI cards per PRD 26 section 5. All stub pending
 * GET /api/v1/audit/operational-metrics endpoint (not yet implemented).
 * Each card is tagged with a "stub" badge and a TODO comment so the
 * no-hardcoded-thresholds lint rule does not flag them.
 */

const STUB_CARDS = [
  { label: "Events / Day (avg)", metric: "audit_events_per_day" },
  { label: "Mutation Coverage", metric: "mutation_coverage_pct" },
  { label: "Storage Footprint", metric: "storage_footprint_gb" },
  { label: "Failed Mutation Rate", metric: "failed_mutation_rate_pct" },
  { label: "Denied (24h)", metric: "denied_24h_count" },
] as const;

export function AuditKPIGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6" data-testid="audit-kpi-grid">
      {STUB_CARDS.map((card) => (
        <div
          key={card.metric}
          className="bg-bg-surface border border-border-subtle rounded-md p-4"
          data-metric={card.metric}
          data-stub="true"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            {card.label}
          </div>
          <div className="font-mono text-text-primary text-2xl font-semibold">
            {"--"}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="px-1 py-0 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
              stub
            </span>
            {/* TODO: replace when /audit/operational-metrics lands */}
            <span className="text-text-subtle text-[11px]">
              awaiting endpoint
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
