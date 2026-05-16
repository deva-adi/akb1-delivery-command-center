/**
 * Backlog Health tab -- M7-14.
 *
 * Route: /home/backlog-health (nested under home/layout.tsx, inherits JWT
 * guard and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, ProgrammeManager, ReadOnly.
 * FinanceLead: explicitly "No" per PRD section 2 -- redirect to /home.
 * DeliveryDirector: not listed -- redirect to /home.
 * HRBusinessPartner: not listed -- redirect to /home.
 * Source: PRD (backlog) section 2. Smallest role gate in M7 (3 roles).
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for health and
 * milestones. backlog_items not seeded; tab uses health RAG + milestone
 * Delayed/At Risk counts as grooming pressure proxy.
 * 403s silently discarded so PM sees only their assigned programme.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isBacklogHealthAllowed,
  buildBacklogProxy,
  buildBacklogWhat,
} from "@/lib/backlog-health";
import type {
  HealthListResponse,
  MilestoneListResponse,
  HealthSnapshotItem,
  MilestoneItem,
} from "@/lib/delivery-health";
import { BacklogIntelligenceCard } from "@/components/BacklogIntelligenceCard";
import { BacklogKPIGrid } from "@/components/BacklogKPIGrid";
import { BacklogAgingHistogram } from "@/components/BacklogAgingHistogram";
import { BacklogDoRBars } from "@/components/BacklogDoRBars";
import { BacklogProgrammeTable } from "@/components/BacklogProgrammeTable";

export default async function BacklogHealthPage({
  searchParams,
}: {
  searchParams: { p?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isBacklogHealthAllowed(user.role)) redirect("/home");

  const activeProgramme = typeof searchParams.p === "string" ? searchParams.p : null;

  const [healthResults, milestoneResults] = await Promise.all([
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<HealthListResponse>(`/api/v1/programmes/${code}/health`),
      ),
    ),
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<MilestoneListResponse>(`/api/v1/programmes/${code}/milestones`),
      ),
    ),
  ]);

  const snapshotsByProgramme = new Map<string, HealthSnapshotItem[]>();
  for (let i = 0; i < healthResults.length; i++) {
    const r = healthResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      snapshotsByProgramme.set(code, r.value.items);
    }
  }

  const milestonesByProgramme = new Map<string, MilestoneItem[]>();
  for (let i = 0; i < milestoneResults.length; i++) {
    const r = milestoneResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      milestonesByProgramme.set(code, r.value.items);
    }
  }

  const hasError =
    healthResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    ) ||
    milestoneResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    );

  const states = buildBacklogProxy(snapshotsByProgramme, milestonesByProgramme);
  const what = buildBacklogWhat(states);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <BacklogIntelligenceCard what={what} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Backlog Health</h2>
          <span className="text-text-subtle text-xs font-mono">
            {what.visibleProgrammes} programme{what.visibleProgrammes !== 1 ? "s" : ""} visible
            {" "}| backlog_items not seeded
          </span>
        </div>
        <BacklogKPIGrid what={what} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-2 gap-6">
          <BacklogAgingHistogram />
          <BacklogDoRBars />
        </div>
      </section>

      <section className="px-8 pb-6">
        <BacklogProgrammeTable states={states} activeProgramme={activeProgramme} />
      </section>
    </div>
  );
}
