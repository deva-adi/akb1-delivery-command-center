/**
 * Flow and Velocity tab -- M7-10.
 *
 * Route: /home/flow-velocity (nested under home/layout.tsx, inherits JWT
 * guard and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ProgrammeManager, ReadOnly.
 * FinanceLead, HRBusinessPartner redirect to /home.
 * Source: PRD 10 section 2 (DD added per D-053 to maintain operational parity
 * with Delivery Health; PRD did not list DD explicitly).
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for milestones
 * and health in parallel. 403s silently discarded so PM sees only their
 * assigned programme.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isFlowAllowed,
  buildFlowWhat,
  buildFlowKPIs,
  buildWIPProxy,
  buildSprintWindowTable,
} from "@/lib/flow-velocity";
import type { MilestoneListResponse, HealthListResponse } from "@/lib/delivery-health";
import { FlowIntelligenceCard } from "@/components/FlowIntelligenceCard";
import { FlowKPIGrid } from "@/components/FlowKPIGrid";
import { FlowCFDChart } from "@/components/FlowCFDChart";
import { FlowWIPBars } from "@/components/FlowWIPBars";
import { FlowSprintTable } from "@/components/FlowSprintTable";
import { FlowDORASection } from "@/components/FlowDORASection";

export default async function FlowVelocityPage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isFlowAllowed(user.role)) redirect("/home");

  const [milestoneResults, healthResults] = await Promise.all([
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<MilestoneListResponse>(`/api/v1/programmes/${code}/milestones`),
      ),
    ),
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<HealthListResponse>(`/api/v1/programmes/${code}/health`),
      ),
    ),
  ]);

  const allMilestones = milestoneResults
    .filter(
      (r): r is PromiseFulfilledResult<MilestoneListResponse> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value.items);

  const healthByProgramme: Record<string, NonNullable<HealthListResponse["items"]>> = {};
  for (let i = 0; i < healthResults.length; i++) {
    const r = healthResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      healthByProgramme[code] = r.value.items;
    }
  }

  const hasError =
    milestoneResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    ) ||
    healthResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    );

  const intel = buildFlowWhat(allMilestones);
  const kpis = buildFlowKPIs(allMilestones);
  const wipRows = buildWIPProxy(allMilestones);
  const sprintRows = buildSprintWindowTable(allMilestones);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <FlowIntelligenceCard intel={intel} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Flow and Velocity</h2>
          <span className="text-text-subtle text-xs font-mono">
            {intel.visibleProgrammes} programme{intel.visibleProgrammes !== 1 ? "s" : ""} visible
          </span>
        </div>
        <FlowKPIGrid kpis={kpis} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <FlowCFDChart />
          </div>
          <div>
            <FlowWIPBars rows={wipRows} />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6">
        <FlowSprintTable rows={sprintRows} healthByProgramme={healthByProgramme} />
      </section>

      <FlowDORASection />
    </div>
  );
}
