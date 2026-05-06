/**
 * Portfolio Gross Margin R12M chart.
 *
 * STUB: No financial history in the current backend seed.
 * Renders the wireframe placeholder SVG so the visual contract is preserved.
 * TODO: replace with actuals when financials_monthly endpoint lands.
 */

export function ExecutiveMarginChart() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="executive-margin-chart"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Portfolio Gross Margin</h3>
        <span className="text-text-subtle text-xs">Rolling 12 months</span>
      </div>
      <p className="text-text-muted text-xs mb-2">
        Gross margin compression from 23.8 to 19.2 percent. Target band in gold.
      </p>
      <p className="text-text-subtle text-[10px] mb-3 px-2 py-1 bg-border-subtle/30 rounded border border-border-subtle inline-block">
        Placeholder data -- financials_monthly endpoint not yet implemented
      </p>

      <svg
        className="w-full h-52"
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        aria-label="Portfolio gross margin trend chart (placeholder)"
      >
        <line x1="40" y1="40" x2="790" y2="40" stroke="#3A4454" strokeWidth="1" />
        <line x1="40" y1="90" x2="790" y2="90" stroke="#3A4454" strokeWidth="1" />
        <line x1="40" y1="140" x2="790" y2="140" stroke="#3A4454" strokeWidth="1" />
        <line x1="40" y1="190" x2="790" y2="190" stroke="#4A5568" strokeWidth="1" />

        <text x="10" y="45" fill="#718096" fontSize="11" fontFamily="JetBrains Mono, monospace">26%</text>
        <text x="10" y="95" fill="#718096" fontSize="11" fontFamily="JetBrains Mono, monospace">22%</text>
        <text x="10" y="145" fill="#718096" fontSize="11" fontFamily="JetBrains Mono, monospace">18%</text>
        <text x="10" y="195" fill="#718096" fontSize="11" fontFamily="JetBrains Mono, monospace">14%</text>

        <rect x="40" y="75" width="750" height="15" fill="#F5B800" fillOpacity="0.08" />
        <line x1="40" y1="78" x2="790" y2="78" stroke="#F5B800" strokeDasharray="4 4" opacity="0.5" />
        <text x="744" y="73" fill="#F5B800" fontSize="10" fontWeight="500">21% target</text>

        <polyline
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeLinejoin="round"
          points="60,55 125,60 190,65 255,72 320,80 385,88 450,100 515,112 580,125 645,138 710,150 775,155"
        />
        <circle cx="775" cy="155" r="4" fill="#EF4444" stroke="#242D3D" strokeWidth="2" />

        <text x="60" y="210" fill="#718096" fontSize="10" textAnchor="middle">May</text>
        <text x="320" y="210" fill="#718096" fontSize="10" textAnchor="middle">Sep</text>
        <text x="580" y="210" fill="#718096" fontSize="10" textAnchor="middle">Jan</text>
        <text x="775" y="210" fill="#F1F5F9" fontSize="10" textAnchor="middle" fontWeight="600">Apr</text>
      </svg>
    </div>
  );
}
