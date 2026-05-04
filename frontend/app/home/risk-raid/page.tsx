/**
 * Risk and RAID tab -- M7-3.
 *
 * Route: /home/risk-raid (nested under home/layout.tsx, inherits JWT guard
 * and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ProgrammeManager, FinanceLead.
 * HRBP and ReadOnly are redirected to /home.
 *
 * Data fetch: attempts GET /api/v1/programmes/{code}/raids for all 10 seed
 * codes in parallel. The backend returns 403 for codes the caller cannot
 * access (scoped roles). Promise.allSettled collects fulfilled responses and
 * silently discards 403s, so PO sees all 10 programmes and DD/FL/PM see only
 * their assigned ones -- no extra endpoint needed.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import {
  PROGRAMME_CODES,
  buildHeatMap,
  buildTop10,
  buildTrend,
  computeKPIs,
  isRaidAllowed,
} from "@/lib/raids";
import type { RaidListResponse } from "@/lib/raids";
import { RaidHeatMap } from "@/components/RaidHeatMap";
import { RaidTrend } from "@/components/RaidTrend";
import { RaidTop10 } from "@/components/RaidTop10";
import { RaidIntelligenceCard } from "@/components/RaidIntelligenceCard";

export default async function RiskRaidPage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isRaidAllowed(user.role)) redirect("/home");

  const results = await Promise.allSettled(
    PROGRAMME_CODES.map((code) =>
      callBackend<RaidListResponse>(`/api/v1/programmes/${code}/raids`),
    ),
  );

  const allRaids = results
    .filter((r): r is PromiseFulfilledResult<RaidListResponse> => r.status === "fulfilled")
    .flatMap((r) => r.value.items);

  const hasError = results.some(
    (r) => r.status === "rejected" && !(r.reason instanceof BackendError && r.reason.status === 403),
  );

  const heatMapRows = buildHeatMap(allRaids);
  const top10 = buildTop10(allRaids);
  const trendBuckets = buildTrend(allRaids);
  const kpis = computeKPIs(allRaids);

  const visibleCount = new Set(allRaids.map((r) => r.programme_code)).size;

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <RaidIntelligenceCard kpis={kpis} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Risk and RAID</h2>
          <span className="text-text-subtle text-xs font-mono">
            {visibleCount} programme{visibleCount !== 1 ? "s" : ""} visible
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RaidHeatMap rows={heatMapRows} />
          </div>
          <div>
            <RaidTrend buckets={trendBuckets} />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KpiCard label="Open RAID" value={String(kpis.openCount)} meta="R + A + I + D" />
          <KpiCard
            label="High Severity"
            value={String(kpis.highSevCount)}
            meta="Critical + High"
            alert={kpis.highSevCount > 15}
          />
          <KpiCard
            label="Aging > 30 days"
            value={String(kpis.agingCount)}
            meta="Open and escalated"
            alert={kpis.agingCount > 5}
          />
          <KpiCard
            label="Programmes"
            value={String(visibleCount)}
            meta="In scope"
          />
          <KpiCard
            label="Types tracked"
            value="4"
            meta="R, A, I, D"
          />
        </div>

        <RaidTop10 items={top10} />
      </section>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  meta: string;
  alert?: boolean;
}

function KpiCard({ label, value, meta, alert = false }: KpiCardProps) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 hover:border-border-strong transition">
      <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
        {label}
      </div>
      <div
        className={`text-4xl font-semibold font-mono tabular ${
          alert ? "text-status-red" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div className="text-text-subtle text-xs mt-2">{meta}</div>
    </div>
  );
}
