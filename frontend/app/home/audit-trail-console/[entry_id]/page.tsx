/**
 * Audit Trail Console -- Level 2 entry detail.
 *
 * Route: /home/audit-trail-console/[entry_id]
 *
 * Server Component: fetches entry via callBackend, renders before/after JSON
 * panels and key metadata. AP enforcement is backend-side on the proxied
 * GET /api/v1/audit/entry/{id} route.
 *
 * DrillDetailLayout (client component) handles the back button.
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { isAuditAllowed, formatTimestamp } from "@/lib/audit-console";
import type { AuditEntryDetail } from "@/lib/audit-console";
import { DrillDetailLayout } from "@/components/drill/DrillDetailLayout";

export default async function AuditEntryDetailPage({
  params,
}: {
  params: { entry_id: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isAuditAllowed(user.role)) redirect("/home");

  let entry: AuditEntryDetail | null = null;

  try {
    entry = await callBackend<AuditEntryDetail>(
      `/api/v1/audit/entry/${params.entry_id}`,
    );
  } catch (err) {
    if (err instanceof BackendError && err.status === 404) {
      redirect("/home/audit-trail-console");
    }
    redirect("/home/audit-trail-console");
  }

  if (entry === null) {
    redirect("/home/audit-trail-console");
  }

  const outcomeIsPositive =
    entry.outcome === "Created" ||
    entry.outcome === "Updated" ||
    entry.outcome === "Success";

  const outcomeBadgeClass = outcomeIsPositive
    ? "px-2 py-0.5 rounded text-xs font-semibold bg-status-green/20 text-status-green"
    : "px-2 py-0.5 rounded text-xs font-semibold bg-status-red/20 text-status-red";

  const beforeJson = entry.before_json !== null
    ? JSON.stringify(entry.before_json, null, 2)
    : null;

  const afterJson = entry.after_json !== null
    ? JSON.stringify(entry.after_json, null, 2)
    : null;

  return (
    <div className="px-8 py-8">
      <nav
        aria-label="Drill breadcrumb"
        className="flex items-center gap-1.5 text-xs text-text-muted mb-6"
      >
        <a href="/home/audit-trail-console" className="hover:text-text-primary transition-colors">
          Portfolio
        </a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="w-3 h-3 text-text-subtle"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.97 2.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06L8.44 7 4.97 3.53a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
        <a href="/home/audit-trail-console" className="hover:text-text-primary transition-colors">
          Audit Trail
        </a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="w-3 h-3 text-text-subtle"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.97 2.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06L8.44 7 4.97 3.53a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-text-primary font-medium">
          Entry {params.entry_id.slice(0, 8)}
        </span>
      </nav>

      <DrillDetailLayout
        title={`Audit Entry: ${entry.resource_type}`}
        backHref="/home/audit-trail-console"
        backLabel="Back to Audit Trail"
      >
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 space-y-4">
          <h2 className="text-text-primary text-sm font-semibold uppercase tracking-wider text-text-muted">
            Entry Metadata
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Actor</dt>
              <dd className="font-mono text-text-primary text-xs">{entry.actor_user_id}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Role</dt>
              <dd className="text-text-primary text-xs">{entry.actor_role}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Timestamp</dt>
              <dd className="font-mono text-text-primary text-xs">
                {formatTimestamp(entry.occurred_at)}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Table</dt>
              <dd className="text-text-primary text-xs">{entry.resource_type}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Record ID</dt>
              <dd className="font-mono text-text-primary text-xs">
                {entry.resource_id ?? <span className="text-text-subtle italic">none</span>}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Outcome</dt>
              <dd>
                <span className={outcomeBadgeClass}>{entry.outcome}</span>
              </dd>
            </div>
            {entry.ip_address !== null && (
              <div>
                <dt className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">IP Address</dt>
                <dd className="font-mono text-text-primary text-xs">{entry.ip_address}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-text-muted text-[11px] uppercase tracking-wider mb-2">Before</h3>
            {beforeJson !== null ? (
              <pre
                className="text-xs font-mono bg-bg-surface-subtle rounded p-3 overflow-auto max-h-80 text-text-primary whitespace-pre-wrap border border-border-subtle"
                data-testid="before-json-panel"
              >
                {beforeJson}
              </pre>
            ) : (
              <div
                className="bg-bg-surface-subtle rounded p-3 border border-border-subtle"
                data-testid="before-json-panel"
              >
                <span className="text-text-muted italic text-sm">No previous state</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-text-muted text-[11px] uppercase tracking-wider mb-2">After</h3>
            {afterJson !== null ? (
              <pre
                className="text-xs font-mono bg-bg-surface-subtle rounded p-3 overflow-auto max-h-80 text-text-primary whitespace-pre-wrap border border-border-subtle"
                data-testid="after-json-panel"
              >
                {afterJson}
              </pre>
            ) : (
              <div
                className="bg-bg-surface-subtle rounded p-3 border border-border-subtle"
                data-testid="after-json-panel"
              >
                <span className="text-text-muted italic text-sm">No subsequent state</span>
              </div>
            )}
          </div>
        </div>
      </DrillDetailLayout>
    </div>
  );
}
