/**
 * Client Health tab -- M7-13.
 *
 * Route: /home/client-health (nested under home/layout.tsx, inherits JWT guard
 * and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, ProgrammeManager, FinanceLead, ReadOnly.
 * DeliveryDirector, HRBusinessPartner redirect to /home.
 * Source: PRD 18 section 2 (DD not listed; HRBP not listed; FL listed; PM
 * scoping deferred -- client_signals not seeded, same deferral as D-055).
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for health and
 * milestones. client_signals not seeded; tab relies on health RAG proxy.
 * 403s silently discarded so PM sees only their assigned programme.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isClientHealthAllowed,
  buildClientHealthProxy,
  buildClientHealthWhat,
} from "@/lib/client-health";
import type { HealthListResponse, MilestoneListResponse, HealthSnapshotItem } from "@/lib/delivery-health";
import { ClientHealthIntelligenceCard } from "@/components/ClientHealthIntelligenceCard";
import { ClientHealthKPIGrid } from "@/components/ClientHealthKPIGrid";
import { ClientSignalMatrix } from "@/components/ClientSignalMatrix";
import { ClientHealthRadar } from "@/components/ClientHealthRadar";
import { ClientInterventionPlaybook } from "@/components/ClientInterventionPlaybook";
import { ClientHealthRev4Section } from "@/components/ClientHealthRev4Section";

export default async function ClientHealthPage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isClientHealthAllowed(user.role)) redirect("/home");

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

  const healthByProgramme = new Map<string, HealthSnapshotItem[]>();
  for (let i = 0; i < healthResults.length; i++) {
    const r = healthResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      healthByProgramme.set(code, r.value.items);
    }
  }

  const allMilestones = milestoneResults
    .filter(
      (r): r is PromiseFulfilledResult<MilestoneListResponse> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value.items);

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

  const states = buildClientHealthProxy(healthByProgramme);
  const intel = buildClientHealthWhat(states, allMilestones);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <ClientHealthIntelligenceCard intel={intel} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Client Health</h2>
          <span className="text-text-subtle text-xs font-mono">
            {intel.visibleProgrammes} programme{intel.visibleProgrammes !== 1 ? "s" : ""} visible
            {" "}| client_signals not seeded
          </span>
        </div>
        <ClientHealthKPIGrid intel={intel} />
      </section>

      <section className="px-8 pb-6">
        <ClientSignalMatrix states={states} intel={intel} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ClientInterventionPlaybook />
          </div>
          <div>
            <ClientHealthRadar />
          </div>
        </div>
      </section>

      <ClientHealthRev4Section />
    </div>
  );
}
