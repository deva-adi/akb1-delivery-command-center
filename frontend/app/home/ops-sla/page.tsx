/**
 * Ops and SLA tab -- M7-11.
 *
 * Route: /home/ops-sla (nested under home/layout.tsx, inherits JWT guard
 * and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ProgrammeManager, ReadOnly.
 * FinanceLead, HRBusinessPartner redirect to /home.
 * Source: PRD 15 section 2 (FL penalty-view grant narrowed to redirect per
 * D-054; DD added per D-054 for operational parity with Delivery Health).
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for health and
 * milestones in parallel. 403s silently discarded so PM sees only their
 * assigned programme.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isOpsAllowed,
  buildOpsWhat,
  buildOpsKPIs,
  buildSLAMatrix,
} from "@/lib/ops-sla";
import type { HealthListResponse, MilestoneListResponse } from "@/lib/delivery-health";
import { OpsIntelligenceCard } from "@/components/OpsIntelligenceCard";
import { OpsKPIGrid } from "@/components/OpsKPIGrid";
import { OpsSLAMatrix } from "@/components/OpsSLAMatrix";
import { OpsIncidentTrend } from "@/components/OpsIncidentTrend";
import { OpsSLABreachTable } from "@/components/OpsSLABreachTable";
import { OpsDecisionQueue } from "@/components/OpsDecisionQueue";
import { OpsRev4Section } from "@/components/OpsRev4Section";

export default async function OpsSLAPage({
  searchParams,
}: {
  searchParams: { p?: string; sla?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isOpsAllowed(user.role)) redirect("/home");

  const activeProgramme = typeof searchParams.p === "string" ? searchParams.p : null;
  const activeSla = typeof searchParams.sla === "string" ? searchParams.sla : null;

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

  const healthByProgramme: Record<string, NonNullable<HealthListResponse["items"]>> = {};
  for (let i = 0; i < healthResults.length; i++) {
    const r = healthResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      healthByProgramme[code] = r.value.items;
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

  const intel = buildOpsWhat(healthByProgramme, allMilestones);
  const kpis = buildOpsKPIs(healthByProgramme);
  const matrixRows = buildSLAMatrix(healthByProgramme);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <OpsIntelligenceCard intel={intel} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Ops and SLA</h2>
          <span className="text-text-subtle text-xs font-mono">
            {intel.visibleProgrammes} programme{intel.visibleProgrammes !== 1 ? "s" : ""} visible
          </span>
        </div>
        <OpsKPIGrid kpis={kpis} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <OpsSLAMatrix
                rows={matrixRows}
                activeProgramme={activeProgramme}
                activeSla={activeSla}
              />
          </div>
          <div>
            <OpsIncidentTrend />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6">
        <OpsSLABreachTable />
      </section>

      <section className="px-8 pb-6">
        <OpsDecisionQueue />
      </section>

      <OpsRev4Section />
    </div>
  );
}
