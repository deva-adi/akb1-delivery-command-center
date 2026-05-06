import type { SprintBucket } from "@/lib/delivery-health";

interface Props {
  buckets: SprintBucket[];
}

const CHART_W = 800;
const CHART_H = 220;
const PAD_L = 44;
const PAD_B = 30;
const PAD_T = 20;
const PAD_R = 10;

const PLOT_W = CHART_W - PAD_L - PAD_R;
const PLOT_H = CHART_H - PAD_T - PAD_B;

const CAPACITY_RATIO = 0.9;

function ratioToY(ratio: number): number {
  return PAD_T + PLOT_H * (1 - ratio);
}

function indexToX(i: number, total: number): number {
  if (total <= 1) return PAD_L + PLOT_W / 2;
  return PAD_L + (i / (total - 1)) * PLOT_W;
}

function pointColor(ratio: number): string {
  if (ratio < 0.8) return "#EF4444";
  if (ratio < 0.92) return "#F59E0B";
  return "#60A5FA";
}

export function DeliveryHealthVelocityChart({ buckets }: Props) {
  const visible = buckets.slice(-8);
  const n = visible.length;

  const yLines = [0, 0.25, 0.5, 0.75, 1.0];

  const capacityY = ratioToY(CAPACITY_RATIO);

  const actualPoints = visible.map((b, i) => {
    const ratio = b.total === 0 ? 0 : b.completed / b.total;
    return { x: indexToX(i, n), y: ratioToY(ratio), ratio };
  });

  const actualPolyline = actualPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="delivery-health-velocity-chart"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Sprint Velocity</h3>
        <span className="text-text-subtle text-xs">Last {n} sprint{n !== 1 ? "s" : ""}</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Milestone completion rate (solid) vs 90% capacity target (dashed).
      </p>

      {n === 0 ? (
        <div className="flex items-center justify-center h-52 text-text-subtle text-sm">
          No milestone data in range.
        </div>
      ) : (
        <svg
          className="w-full h-52"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          aria-label="Sprint velocity chart"
        >
          {yLines.map((ratio) => (
            <line
              key={ratio}
              x1={PAD_L}
              y1={ratioToY(ratio)}
              x2={CHART_W - PAD_R}
              y2={ratioToY(ratio)}
              stroke="#3A4454"
              strokeWidth="1"
            />
          ))}

          {yLines.map((ratio) => (
            <text
              key={`label-${ratio}`}
              x={PAD_L - 6}
              y={ratioToY(ratio) + 4}
              fill="#718096"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              {Math.round(ratio * 100)}%
            </text>
          ))}

          <line
            x1={PAD_L}
            y1={capacityY}
            x2={CHART_W - PAD_R}
            y2={capacityY}
            stroke="#F5B800"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {n > 1 && (
            <polyline
              fill="none"
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={actualPolyline}
            />
          )}

          {actualPoints.map((p, i) => {
            const isLast3 = i >= n - 3;
            const fill = isLast3 ? pointColor(p.ratio) : "#60A5FA";
            const r = isLast3 ? 4.5 : 3;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={r}
                fill={fill}
                stroke="#242D3D"
                strokeWidth={isLast3 ? 2 : 0}
              />
            );
          })}

          {visible.map((b, i) => (
            <text
              key={`sprint-${i}`}
              x={indexToX(i, n)}
              y={CHART_H - 8}
              fill={i >= n - 3 ? "#F59E0B" : "#718096"}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              S{b.sprint + 1}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}
