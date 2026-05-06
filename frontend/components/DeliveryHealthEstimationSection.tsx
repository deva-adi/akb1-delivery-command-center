import type { EstimationRow, EVMMetrics } from "@/lib/delivery-health";

interface Props {
  rows: EstimationRow[];
  evm: EVMMetrics;
  highlightCode: string;
}

function accuracyColor(accuracy: number): string {
  if (accuracy >= 85) return "text-status-green";
  if (accuracy >= 70) return "text-status-amber";
  return "text-status-red";
}

function spiColor(spi: number): string {
  if (spi >= 0.95) return "text-status-green border-status-green/40";
  if (spi >= 0.8) return "text-status-amber border-status-amber/40";
  return "text-status-red border-status-red/40";
}

function cpiColor(cpi: number): string {
  if (cpi >= 0.95) return "text-status-green border-status-green/40";
  if (cpi >= 0.8) return "text-status-amber border-status-amber/40";
  return "text-status-red border-status-red/40";
}

export function DeliveryHealthEstimationSection({ rows, evm, highlightCode }: Props) {
  return (
    <div
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6 mt-8"
      data-testid="delivery-health-estimation-section"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 4
        </div>
        <h2 className="text-text-primary text-lg font-semibold">
          Estimation Accuracy and EVM
        </h2>
        <span className="text-text-muted text-xs">UC-P EVM, UC-GG estimation negotiation, UC-S over-optimism flag</span>
      </div>

      <h3 className="text-accent-gold text-sm font-semibold tracking-tight mb-3">
        Estimation Accuracy per Programme (UC-GG)
      </h3>
      <p className="text-text-muted text-xs mb-3">
        Silent baseline drift: actual varies more than 20% without a formal change record.
      </p>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 mb-6">
        <table className="w-full text-xs" data-testid="estimation-accuracy-table">
          <thead className="text-text-muted text-[10px] uppercase tracking-wider">
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2">Programme</th>
              <th className="text-right py-2">Total milestones</th>
              <th className="text-right py-2">On plan</th>
              <th className="text-right py-2">Accuracy</th>
              <th className="text-center py-2">Silent drift</th>
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            {rows.map((row) => (
              <tr
                key={row.programmeCode}
                className="border-b border-border-subtle/50 hover:bg-border-subtle/20 transition"
                data-testid={`estimation-row-${row.programmeCode}`}
              >
                <td className="py-2 text-text-primary font-medium">{row.programmeCode}</td>
                <td className="text-right font-mono tabular">{row.totalMilestones}</td>
                <td className="text-right font-mono tabular">{row.completedOrOnTrack}</td>
                <td
                  className={`text-right font-mono tabular font-semibold ${accuracyColor(row.accuracy)}`}
                >
                  {row.accuracy.toFixed(1)}%
                </td>
                <td className="text-center">
                  {row.silentDrift > 0 ? (
                    <span className="px-2 py-0.5 bg-status-red/20 text-status-red rounded text-[10px] font-semibold">
                      {row.silentDrift} unpriced
                    </span>
                  ) : (
                    <span className="text-status-green">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-accent-gold text-sm font-semibold tracking-tight mb-3">
        EVM Quartet (UC-P) -- {highlightCode}
      </h3>

      <div className="grid grid-cols-4 gap-3">
        <div
          className={`bg-bg-surface border rounded-md p-4 ${spiColor(evm.spi)}`}
          data-testid="evm-spi"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">SPI</div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular">
              {evm.spi.toFixed(2)}
            </span>
            <span className="text-text-muted text-xs">{highlightCode}</span>
          </div>
          <div className={`mt-1 text-[11px] ${spiColor(evm.spi).split(" ")[0]}`}>
            {evm.spi >= 0.95 ? "On schedule" : evm.spi >= 0.8 ? "Below 0.95 target" : "Schedule risk"}
          </div>
        </div>

        <div
          className={`bg-bg-surface border rounded-md p-4 ${cpiColor(evm.cpi)}`}
          data-testid="evm-cpi"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">CPI</div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular">
              {evm.cpi.toFixed(2)}
            </span>
            <span className="text-text-muted text-xs">{highlightCode}</span>
          </div>
          <div className={`mt-1 text-[11px] ${cpiColor(evm.cpi).split(" ")[0]}`}>
            {evm.cpi >= 0.95 ? "Within range" : "Synthetic proxy"}
          </div>
        </div>

        <div
          className="bg-bg-surface border border-status-green/40 rounded-md p-4"
          data-testid="evm-tcpi"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">TCPI</div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular">
              {evm.tcpi.toFixed(2)}
            </span>
            <span className="text-text-muted text-xs">{highlightCode}</span>
          </div>
          <div className="mt-1 text-[11px] text-status-green">
            Synthetic proxy
          </div>
        </div>

        <div
          className="bg-bg-surface border border-border-subtle rounded-md p-4"
          data-testid="evm-eac"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">EAC</div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular">
              {evm.eacLabel}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">
            Awaiting financials endpoint
          </div>
        </div>
      </div>
    </div>
  );
}
