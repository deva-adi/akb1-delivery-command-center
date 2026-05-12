import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { isDeliveryHealthAllowed } from "@/lib/delivery-health";
import type { MilestoneItem, HealthListResponse } from "@/lib/delivery-health";
import { DrillDetailLayout } from "@/components/drill/DrillDetailLayout";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function varianceDays(baseline: string | null, due: string): string {
  if (baseline === null) return "N/A";
  const diff = Math.round(
    (new Date(due).getTime() - new Date(baseline).getTime()) / MS_PER_DAY,
  );
  if (diff === 0) return "On plan";
  return diff > 0 ? `+${diff}d` : `${diff}d`;
}

function statusBadgeClass(status: string): string {
  if (status === "Delayed") return "bg-status-red/20 text-status-red border-status-red/40";
  if (status === "At Risk") return "bg-status-amber/20 text-status-amber border-status-amber/40";
  if (status === "Complete") return "bg-status-green/20 text-status-green border-status-green/40";
  return "bg-border-subtle/40 text-text-muted border-border-subtle";
}

function ragBadgeClass(rag: string): string {
  if (rag === "Red" || rag === "Failing")
    return "bg-status-red/10 text-status-red border-status-red/40";
  if (rag === "Amber" || rag === "Watching")
    return "bg-status-amber/10 text-status-amber border-status-amber/40";
  return "bg-status-green/10 text-status-green border-status-green/40";
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="text-text-primary text-xs font-medium text-right">{children}</span>
    </div>
  );
}

export default async function MilestoneDetailPage({
  params,
}: {
  params: { code: string; milestone_id: string };
}): Promise<JSX.Element> {
  const { code, milestone_id } = params;

  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isDeliveryHealthAllowed(user.role)) redirect("/home");

  const [milestoneResult, healthResult] = await Promise.allSettled([
    callBackend<MilestoneItem>(
      `/api/v1/programmes/${code}/milestones/${milestone_id}`,
    ),
    callBackend<HealthListResponse>(`/api/v1/programmes/${code}/health`),
  ]);

  if (milestoneResult.status === "rejected") {
    if (
      milestoneResult.reason instanceof BackendError &&
      milestoneResult.reason.status === 404
    ) {
      notFound();
    }
    throw milestoneResult.reason as Error;
  }

  const milestone = milestoneResult.value;
  const healthItems =
    healthResult.status === "fulfilled" ? healthResult.value.items : [];
  const latestRag = healthItems[0]?.overall_rag ?? null;

  const variance = varianceDays(milestone.baseline_date, milestone.due_date);

  return (
    <DrillDetailLayout
      title={milestone.title}
      backHref={`/home/delivery-health?p=${code}`}
      backLabel={`Back to ${code}`}
    >
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="milestone-detail-card"
      >
        <h2 className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-4">
          Milestone
        </h2>
        <div>
          <DetailRow label="Status">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusBadgeClass(milestone.status)}`}
            >
              {milestone.status}
            </span>
          </DetailRow>
          <DetailRow label="Programme">{code}</DetailRow>
          <DetailRow label="Forecast date">{milestone.due_date}</DetailRow>
          <DetailRow label="Baseline date">
            {milestone.baseline_date ?? "Not set"}
          </DetailRow>
          <DetailRow label="Variance">{variance}</DetailRow>
          <DetailRow label="Completion">{milestone.completion_pct}%</DetailRow>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <h2 className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-4">
          Programme health
        </h2>
        <div>
          <DetailRow label="Programme code">{code}</DetailRow>
          <DetailRow label="Health state">
            {latestRag !== null ? (
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${ragBadgeClass(latestRag)}`}
                data-testid="milestone-detail-health-badge"
              >
                {latestRag}
              </span>
            ) : (
              <span className="text-text-subtle text-xs">No snapshot</span>
            )}
          </DetailRow>
          <DetailRow label="Last updated">
            {milestone.updated_at.slice(0, 10)}
          </DetailRow>
          <DetailRow label="Created">
            {milestone.created_at.slice(0, 10)}
          </DetailRow>
        </div>
      </div>
    </DrillDetailLayout>
  );
}
