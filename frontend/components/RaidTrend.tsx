import type { WeekBucket } from "@/lib/raids";

interface Props {
  buckets: WeekBucket[];
}

const W = 340;
const H = 140;
const PAD_L = 24;
const PAD_B = 20;

const CHART_W = W - PAD_L;
const CHART_H = H - PAD_B;

function toPoints(
  xs: number[],
  topYs: number[],
  bottomYs: number[],
): string {
  const forward = xs.map((x, i) => `${x},${topYs[i]}`).join(" ");
  const backward = xs
    .map((x, i) => `${x},${bottomYs[i]}`)
    .reverse()
    .join(" ");
  return `${forward} ${backward}`;
}

export function RaidTrend({ buckets }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 h-full flex flex-col">
        <h3 className="text-text-primary font-semibold mb-1">RAID Trend</h3>
        <p className="text-text-muted text-xs flex-1 flex items-center">
          No trend data available.
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(
    ...buckets.map((b) => b.critical + b.high + b.medium + b.low),
    1,
  );

  const n = buckets.length;
  const xStep = n > 1 ? CHART_W / (n - 1) : CHART_W;

  function xAt(i: number) {
    return PAD_L + (n > 1 ? i * xStep : CHART_W / 2);
  }

  function yAt(value: number) {
    return CHART_H - (value / maxTotal) * CHART_H;
  }

  const xs = buckets.map((_, i) => xAt(i));

  const bottomLine = buckets.map(() => CHART_H);
  const lowTops = buckets.map((b) => yAt(b.low));
  const medTops = buckets.map((b) => yAt(b.low + b.medium));
  const highTops = buckets.map((b) => yAt(b.low + b.medium + b.high));
  const critTops = buckets.map((b) =>
    yAt(b.low + b.medium + b.high + b.critical),
  );

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * CHART_H));

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 flex flex-col">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">RAID Trend</h3>
        <span className="text-text-subtle text-xs">By week of raised date</span>
      </div>
      <p className="text-text-muted text-xs mb-3">
        Stacked by severity. {buckets.length} week
        {buckets.length !== 1 ? "s" : ""} of data.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-label="RAID trend stacked area chart"
      >
        {gridYs.map((gy) => (
          <line
            key={gy}
            x1={PAD_L}
            y1={gy}
            x2={W}
            y2={gy}
            className="stroke-border-subtle"
            strokeWidth="0.5"
          />
        ))}

        <polygon
          className="fill-border-strong/40"
          points={toPoints(xs, lowTops, bottomLine)}
        />
        <polygon
          className="fill-text-subtle/40"
          points={toPoints(xs, medTops, lowTops)}
        />
        <polygon
          className="fill-status-amber/50"
          points={toPoints(xs, highTops, medTops)}
        />
        <polygon
          className="fill-status-red/60"
          points={toPoints(xs, critTops, highTops)}
        />

        {n <= 12 && (
          <>
            <text
              x={xAt(0)}
              y={H - 4}
              className="fill-text-subtle text-[9px]"
              fontSize="9"
              textAnchor="middle"
            >
              W1
            </text>
            <text
              x={xAt(n - 1)}
              y={H - 4}
              className="fill-text-primary text-[9px]"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              W{n}
            </text>
          </>
        )}
      </svg>

      <div className="flex gap-4 text-[10px] mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-red inline-block" />
          <span className="text-text-muted">Critical</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-amber inline-block" />
          <span className="text-text-muted">High</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-text-subtle inline-block" />
          <span className="text-text-muted">Medium</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-border-strong inline-block" />
          <span className="text-text-muted">Low</span>
        </span>
      </div>
    </div>
  );
}
