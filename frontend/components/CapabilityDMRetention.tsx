/**
 * DM Retention Conversation Cadence panel -- stub.
 *
 * Restricted to PO and DD only per PRD 24 section 6.6 and Q5 ruling.
 * Note field encryption (pgcrypto) is not wired. dm_retention_conversation
 * entity not yet seeded.
 *
 * Non-PO/DD callers see a RESTRICTED badge. PO/DD callers see the stub table
 * shell with note-masked display.
 * TODO: replace when GET /api/v1/capability/dm-retention-cadence lands.
 */

interface Props {
  userRole: string;
}

export function CapabilityDMRetention({ userRole }: Props): JSX.Element {
  const canAccess = userRole === "PortfolioOwner" || userRole === "DeliveryDirector";

  return (
    <section
      className="bg-bg-surface border border-border-subtle rounded-md p-5 mb-8"
      data-stub="true"
      data-testid="capability-dm-retention"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-text-primary text-base font-semibold">
            DM Retention Conversation Cadence
          </h2>
          <p className="text-text-muted text-xs mt-0.5">
            PO and DD only. Note text masked by default. Reveal is audited.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canAccess && (
            <span className="px-2 py-0.5 bg-status-red/20 text-status-red rounded text-[10px] font-semibold">
              RESTRICTED
            </span>
          )}
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
      </div>

      {canAccess ? (
        <div className="text-text-muted text-xs text-center py-6">
          {/* TODO: cadence table from dm_retention_conversation entity */}
          Retention cadence table: awaiting GET /api/v1/capability/dm-retention-cadence
        </div>
      ) : (
        <p className="text-text-subtle text-sm text-center py-6">
          DM Retention Conversations are restricted to Portfolio Owner and Delivery Director.
        </p>
      )}
    </section>
  );
}
