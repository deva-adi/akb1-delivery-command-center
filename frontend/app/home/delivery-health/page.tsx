/**
 * Delivery Health tab -- M7-4.
 *
 * Route: /home/delivery-health (nested under home/layout.tsx, inherits JWT
 * guard and role-aware nav).
 *
 * Allowed roles: DeliveryDirector, ProgrammeManager, ReadOnly.
 * PortfolioOwner, FinanceLead, HRBusinessPartner redirect to /home.
 * Source: Data Model PRD section 3.1.10 access matrix.
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for both
 * milestones and health in parallel. 403s silently discarded so scoped roles
 * see only their programmes.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isDeliveryHealthAllowed,
  buildKPIs,
  buildOnTimeByProgramme,
  buildSlippingMilestones,
  buildMilestoneList,
  filterMilestonesByProgramme,
  buildVelocityTrend,
  buildEstimationAccuracy,
  computeEVMForProgramme,
} from "@/lib/delivery-health";
import type { MilestoneListResponse, HealthListResponse } from "@/lib/delivery-health";
import { DeliveryHealthIntelligenceCard } from "@/components/DeliveryHealthIntelligenceCard";
import { DeliveryHealthKPIRow } from "@/components/DeliveryHealthKPIRow";
import { DeliveryHealthVelocityChart } from "@/components/DeliveryHealthVelocityChart";
import { DeliveryHealthOnTimeChart } from "@/components/DeliveryHealthOnTimeChart";
import { DeliveryHealthMilestonesTable } from "@/components/DeliveryHealthMilestonesTable";
import { DeliveryHealthEstimationSection } from "@/components/DeliveryHealthEstimationSection";

export default async function DeliveryHealthPage({
  searchParams,
}: {
  searchParams: { p?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isDeliveryHealthAllowed(user.role)) redirect("/home");

  const activeProgamme = typeof searchParams.p === "string" ? searchParams.p : null;

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

  const scopedMilestones = activeProgamme
    ? filterMilestonesByProgramme(allMilestones, activeProgamme)
    : allMilestones;

  const kpis = buildKPIs(scopedMilestones);
  const onTimeRows = buildOnTimeByProgramme(scopedMilestones);
  const milestoneListRows = activeProgamme
    ? buildMilestoneList(scopedMilestones)
    : buildSlippingMilestones(allMilestones);
  const velocityBuckets = buildVelocityTrend(scopedMilestones);
  const estimationRows = buildEstimationAccuracy(scopedMilestones);

  const highlightCode =
    activeProgamme ??
    estimationRows[0]?.programmeCode ??
    (PROGRAMME_CODES[0] as string);
  const evmMetrics = computeEVMForProgramme(allMilestones, highlightCode);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <DeliveryHealthIntelligenceCard kpis={kpis} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Delivery Health</h2>
          <span className="text-text-subtle text-xs font-mono">
            {kpis.visibleProgrammes} programme{kpis.visibleProgrammes !== 1 ? "s" : ""} visible
            {activeProgamme !== null && (
              <span className="ml-2 text-accent-gold">filtered to {activeProgamme}</span>
            )}
          </span>
        </div>
        <DeliveryHealthKPIRow kpis={kpis} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <DeliveryHealthVelocityChart buckets={velocityBuckets} />
          </div>
          <div>
            <DeliveryHealthOnTimeChart rows={onTimeRows} />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6">
        <DeliveryHealthMilestonesTable
          milestones={milestoneListRows}
          activeProgamme={activeProgamme}
        />
      </section>

      <DeliveryHealthEstimationSection
        rows={estimationRows}
        evm={evmMetrics}
        highlightCode={highlightCode}
      />
    </div>
  );
}
