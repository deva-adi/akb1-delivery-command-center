/**
 * Steerco Pre-Read Kit + Weekly Commitment Review + Sponsor Engagement.
 *
 * All sections are stubs pending dedicated backend entities.
 * TODO: replace when pre_read_documents, commitment_deltas,
 *       and sponsor_engagement tables land.
 */

export function GovPreReadSection() {
  return (
    <section
      className="grid grid-cols-12 gap-6 mb-8"
      data-testid="gov-preread-section"
    >

      <div className="col-span-6 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-text-primary text-base font-semibold">Steerco Pre-Read Kit</h2>
            <p className="text-text-muted text-xs mt-0.5">Upcoming: Pegasus Thu 30 Apr, Phoenix Fri 01 May</p>
          </div>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">stub</span>
        </div>
        <div className="space-y-3">
          <div className="border border-border-subtle rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-text-primary text-sm font-medium">Pegasus steerco | Thu 30 Apr</div>
              <span className="px-1.5 py-0.5 bg-status-green/20 text-status-green rounded text-[10px]">
                Issued to Steerco
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-[11px]">
              <div>
                <div className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Decision</div>
                <div className="text-text-primary">Milestone recovery</div>
              </div>
              <div>
                <div className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Options</div>
                <div className="text-text-secondary">Descope / Extend / Accept</div>
              </div>
              <div>
                <div className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Recommendation</div>
                <div className="text-text-secondary">Descope with Q3 add-back</div>
              </div>
              <div>
                <div className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Deferral Impact</div>
                <div className="text-text-secondary">minus 120 bps at 2 weeks</div>
              </div>
            </div>
          </div>
          <div className="border border-status-amber/40 rounded-md p-3 bg-status-amber/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-text-primary text-sm font-medium">Phoenix steerco | Fri 01 May</div>
              <span className="px-1.5 py-0.5 bg-status-amber/20 text-status-amber rounded text-[10px]">
                Drafted
              </span>
            </div>
            <div className="text-text-muted text-[11px]">
              Backfill hire decision pending PM review before issue.
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Weekly Commitment</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">stub</span>
        </div>
        <div className="text-text-muted text-[11px] mb-3">
          Heat map this week. Red: delta above 20%.
        </div>
        <div className="grid grid-cols-5 gap-1.5 text-[10px]">
          {[
            { name: "Pegasus", vals: ["-32%", "red"], v2: ["-18%", "amber"], v3: ["+4%", "green"] },
            { name: "Phoenix", vals: ["-2%", "green"], v2: ["+6%", "green"], v3: ["-14%", "amber"] },
            { name: "Orion", vals: ["0%", "green"], v2: ["+2%", "green"], v3: ["-5%", "green"] },
            { name: "Stellar", vals: ["-16%", "amber"], v2: ["-4%", "green"], v3: ["+1%", "green"] },
          ].map((row) => (
            <>
              <div key={`${row.name}-label`} className="text-text-muted col-span-2 flex items-center">{row.name}</div>
              {[row.vals, row.v2, row.v3].map((v, i) => {
                const cls =
                  v[1] === "red"
                    ? "bg-status-red/40 border border-status-red text-status-red"
                    : v[1] === "amber"
                    ? "bg-status-amber/30 border border-status-amber text-status-amber"
                    : "bg-status-green/30 border border-status-green text-status-green";
                return (
                  <div key={`${row.name}-${i}`} className={`h-7 rounded flex items-center justify-center font-mono ${cls}`}>
                    {v[0]}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-text-primary text-base font-semibold">Sponsor Engagement</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">stub</span>
        </div>
        <div className="text-text-muted text-[11px] mb-3">
          Lowest sponsor score per programme. Below 40 flagged.
        </div>
        <div className="space-y-2">
          {[
            { name: "Pegasus sponsor", score: 38, muted: true },
            { name: "Phoenix sponsor", score: 62, muted: false },
            { name: "Orion sponsor", score: 72, muted: false },
            { name: "Stellar sponsor", score: 78, muted: false },
            { name: "Helix sponsor", score: 81, muted: false },
          ].map((s) => {
            const cls =
              s.score < 40
                ? "bg-status-red/10 border border-status-red/30"
                : s.score < 70
                ? "bg-status-amber/10 border border-status-amber/30"
                : "bg-status-green/5 border border-status-green/30";
            const numCls =
              s.score < 40 ? "text-status-red" : s.score < 70 ? "text-status-amber" : "text-status-green";
            return (
              <div key={s.name} className={`flex items-center justify-between p-2 rounded ${cls}`}>
                <div className="text-text-primary text-xs">{s.name}</div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-semibold ${numCls}`}>{s.score}</span>
                  {s.muted && (
                    <span className="px-1.5 py-0.5 bg-status-red/30 text-status-red text-[9px] rounded font-semibold">
                      ON MUTE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
