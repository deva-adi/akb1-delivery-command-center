/**
 * Audit Trail Console -- cross-cutting surface, M7 slice.
 *
 * Route: /home/audit-trail-console (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, FinanceLead, ProgrammeManager.
 * Redirect to /home: HRBusinessPartner, ReadOnly.
 * Source: PRD 26 section 2 role access table.
 *
 * PM backend gap: PRD 26 grants PM own-action visibility, but the current
 * backend returns 403 RoleDenied on GET /audit/search for PM (slice 4
 * decision, D-040). Page still allows PM per PRD intent; the backend 403
 * surfaces as an AP-required message. Deferred to a future backend slice.
 *
 * Data fetch (server-side):
 *   GET /api/v1/audit/search with time_window=7d, page_size=50.
 *   403 and 401 from the backend are caught and surfaced as apDenied=true,
 *   which renders the AP-required banner instead of the activity stream.
 *
 * Subsequent filter changes and load-more are handled client-side via the
 * AuditActivityStream component using the /api/audit/search Route Handler
 * proxy.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import {
  isAuditAllowed,
  isEntryDetailAllowed,
  type AuditSearchResponse,
} from "@/lib/audit-console";
import { AuditKPIGrid } from "@/components/AuditKPIGrid";
import { AuditActivityStream } from "@/components/AuditActivityStream";

export default async function AuditConsolePage({
  searchParams,
}: {
  searchParams: { actor?: string; table?: string; from?: string; to?: string; outcome?: string };
}): Promise<JSX.Element> {
  const filterActor = typeof searchParams.actor === "string" ? searchParams.actor : null;
  const filterTable = typeof searchParams.table === "string" ? searchParams.table : null;
  const filterFrom = typeof searchParams.from === "string" ? searchParams.from : null;
  const filterTo = typeof searchParams.to === "string" ? searchParams.to : null;
  const filterOutcome = typeof searchParams.outcome === "string" ? searchParams.outcome : null;
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isAuditAllowed(user.role)) redirect("/home");

  let initialData: AuditSearchResponse | null = null;
  let apDenied = false;

  try {
    initialData = await callBackend<AuditSearchResponse>(
      "/api/v1/audit/search?time_window=7d&page_size=50",
    );
  } catch (err) {
    if (
      err instanceof BackendError &&
      (err.status === 403 || err.status === 401)
    ) {
      apDenied = true;
    }
  }

  const canSeeDetail = isEntryDetailAllowed(user.apFlag);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <section className="border-b border-border-subtle px-8 py-5 bg-bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-text-primary text-lg font-semibold">
              Audit Trail Console
            </h1>
            <p className="text-text-muted text-xs mt-0.5">
              Forensic visibility into every state-changing mutation. Storage: Option A full snapshot per Q4 ruling.
            </p>
          </div>
          {canSeeDetail && (
            <span
              className="px-2 py-1 bg-accent-gold/20 border border-accent-gold/40 rounded text-accent-gold text-xs font-medium"
              data-testid="ap-active-badge"
            >
              AP Active
            </span>
          )}
        </div>
      </section>

      <main className="px-8 py-6">
        <AuditKPIGrid />

        <AuditActivityStream
          initialItems={initialData?.items ?? []}
          initialTotalCount={initialData?.total_count ?? 0}
          initialNextCursor={initialData?.next_cursor ?? null}
          apDenied={apDenied}
          canSeeDetail={canSeeDetail}
          filterActor={filterActor}
          filterTable={filterTable}
          filterFrom={filterFrom}
          filterTo={filterTo}
          filterOutcome={filterOutcome}
        />
      </main>
    </div>
  );
}
