/**
 * 5-axis client health radar chart shell.
 * Stub placeholder pending client_signals entity for polygon data.
 * TODO: replace SVG shell with filled polygons when client_signals entity lands.
 */

export function ClientHealthRadar() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="client-health-radar"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">
          Client Health Radar
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="flex items-center justify-center" style={{ height: "260px" }}>
        <div className="relative" style={{ width: "240px", height: "240px" }}>
          {/* 5-axis star outline */}
          <svg
            viewBox="0 0 240 240"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Outer boundary (Healthy zone) */}
            <polygon
              points="120,20 215,78 179,185 61,185 25,78"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-status-green/30"
            />
            {/* Mid boundary (Watch zone) */}
            <polygon
              points="120,56 181,97 158,163 82,163 59,97"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-status-amber/30"
            />
            {/* Inner boundary (Intervene zone) */}
            <polygon
              points="120,91 147,116 137,151 103,151 93,116"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-status-red/30"
            />
            {/* Axis lines */}
            <line x1="120" y1="120" x2="120" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            <line x1="120" y1="120" x2="215" y2="78" stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            <line x1="120" y1="120" x2="179" y2="185" stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            <line x1="120" y1="120" x2="61" y2="185" stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
            <line x1="120" y1="120" x2="25" y2="78" stroke="currentColor" strokeWidth="0.5" className="text-border-subtle" />
          </svg>

          {/* Axis labels */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-[10px] text-text-muted text-center" style={{ top: "2px", left: "50%", transform: "translateX(-50%)" }}>
              Escalations
              <br />
              <span className="text-[9px] text-text-subtle">(low)</span>
            </span>
            <span className="absolute text-[10px] text-text-muted" style={{ top: "60px", right: "0px" }}>
              NPS
            </span>
            <span className="absolute text-[10px] text-text-muted text-center" style={{ bottom: "4px", right: "8px" }}>
              Exec Mtgs
            </span>
            <span className="absolute text-[10px] text-text-muted text-center" style={{ bottom: "4px", left: "4px" }}>
              Ticket Age
              <br />
              <span className="text-[9px] text-text-subtle">(low)</span>
            </span>
            <span className="absolute text-[10px] text-text-muted" style={{ top: "60px", left: "0px" }}>
              Value Real.
            </span>
          </div>

          {/* Zone labels */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-1">
            <span className="text-[9px] text-status-red/60 font-medium">Intervene</span>
            <span className="text-[9px] text-status-amber/60 font-medium">Watch</span>
            <span className="text-[9px] text-status-green/60 font-medium">Healthy</span>
          </div>
        </div>
      </div>

      <p className="text-text-muted text-[11px] mt-2 text-center">
        {/* TODO: replace with live radar polygon data when client_signals entity lands */}
        Polygon data requires client_signals entity. Axis outlines are structural only.
      </p>
    </div>
  );
}
