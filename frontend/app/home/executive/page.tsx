/**
 * Executive tab -- M7-5.
 *
 * Route: /home/executive (nested under home/layout.tsx, inherits JWT guard
 * and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ReadOnly.
 * ProgrammeManager, FinanceLead, HRBusinessPartner redirect to /home.
 * Source: Data Model PRD section 3.1.10 access matrix.
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for raids,
 * milestones, and health in parallel. 403s silently discarded so scoped
 * roles see only their programmes (DD is scoped; PO and RO see all 10).
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import type { RaidListResponse } from "@/lib/raids";
import type { MilestoneListResponse, HealthListResponse } from "@/lib/delivery-health";
import {
  isExecutiveAllowed,
  buildExecutiveKPIs,
  buildProgrammeStateList,
  filterStatesByProgramme,
  filterStatesByHealth,
} from "@/lib/executive";
import { ExecutiveIntelligenceCard } from "@/components/ExecutiveIntelligenceCard";
import { ExecutiveKPIRow } from "@/components/ExecutiveKPIRow";
import { ExecutiveMarginChart } from "@/components/ExecutiveMarginChart";
import { ExecutiveProgrammeStateList } from "@/components/ExecutiveProgrammeStateList";
import { ExecutiveRev4Section } from "@/components/ExecutiveRev4Section";

export default async function ExecutivePage({
  searchParams,
}: {
  searchParams: { p?: string; health?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isExecutiveAllowed(user.role)) redirect("/home");

  const activeProgamme = typeof searchParams.p === "string" ? searchParams.p : null;
  const activeHealth = typeof searchParams.health === "string" ? searchParams.health : null;

  const [raidResults, milestoneResults, healthResults] = await Promise.all([
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<RaidListResponse>(`/api/v1/programmes/${code}/raids`),
      ),
    ),
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

  const allRaids = raidResults
    .filter((r): r is PromiseFulfilledResult<RaidListResponse> => r.status === "fulfilled")
    .flatMap((r) => r.value.items);

  const allMilestones = milestoneResults
    .filter(
      (r): r is PromiseFulfilledResult<MilestoneListResponse> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value.items);

  const allHealth = healthResults
    .filter(
      (r): r is PromiseFulfilledResult<HealthListResponse> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value.items);

  const isNonAuthError = (r: PromiseSettledResult<unknown>) =>
    r.status === "rejected" &&
    !(r.reason instanceof BackendError && r.reason.status === 403);

  const hasError =
    raidResults.some(isNonAuthError) ||
    milestoneResults.some(isNonAuthError) ||
    healthResults.some(isNonAuthError);

  const allProgrammeStates = buildProgrammeStateList(allHealth);

  // Server-side filtering: single programme or health filter
  const filteredRaids = activeProgamme
    ? allRaids.filter((r) => r.programme_code === activeProgamme)
    : allRaids;
  const filteredMilestones = activeProgamme
    ? allMilestones.filter((m) => m.programme_code === activeProgamme)
    : allMilestones;

  let filteredStates = allProgrammeStates;
  if (activeProgamme !== null) {
    filteredStates = filterStatesByProgramme(allProgrammeStates, activeProgamme);
  } else if (activeHealth !== null) {
    filteredStates = filterStatesByHealth(allProgrammeStates, activeHealth);
  }

  const kpis = buildExecutiveKPIs(filteredMilestones, filteredRaids);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <ExecutiveIntelligenceCard
        kpis={kpis}
        programmeStates={filteredStates}
        userRole={user.role}
        activeProgamme={activeProgamme}
      />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Executive Overview</h2>
          <span className="text-text-subtle text-xs font-mono">
            {kpis.visibleProgrammes} programme{kpis.visibleProgrammes !== 1 ? "s" : ""} visible
            {activeProgamme !== null && (
              <span className="ml-2 text-accent-gold">filtered to {activeProgamme}</span>
            )}
          </span>
        </div>
        <ExecutiveKPIRow kpis={kpis} />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ExecutiveMarginChart />
          </div>
          <div>
            <ExecutiveProgrammeStateList
              rows={filteredStates}
              activeProgamme={activeProgamme}
              activeHealth={activeHealth}
            />
          </div>
        </div>
      </section>

      <ExecutiveRev4Section />
    </div>
  );
}
