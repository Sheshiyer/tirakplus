import type { MuseChartSignature } from "../../../shared/contracts";

type MuseChartPanelProps = {
  chart: MuseChartSignature;
  compact?: boolean;
  className?: string;
};

export function MuseChartPanel({ chart, compact = false, className = "" }: MuseChartPanelProps) {
  const classes = ["muse-chart-panel", compact ? "muse-chart-panel-compact" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={classes} aria-label={chart.title}>
      <div className="muse-chart-header">
        <p className="eyebrow">{chart.title}</p>
        <h2>{chart.tagline}</h2>
        <p>{chart.summary}</p>
      </div>

      <div className="muse-chart-orbit" aria-hidden="true">
        {chart.axes.map((axis) => (
          <span key={`${axis.label}-${axis.value}`} className={`muse-chart-dot muse-chart-dot-${axis.tone}`} />
        ))}
      </div>

      <div className="muse-chart-axis-grid">
        {chart.axes.map((axis) => (
          <div key={axis.label} className={`muse-chart-axis muse-chart-axis-${axis.tone}`}>
            <span>{axis.label}</span>
            <strong>{axis.value}</strong>
          </div>
        ))}
      </div>

      {!compact ? (
        <ul className="muse-chart-cues">
          {chart.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      ) : null}

      <p className="muse-chart-next">{chart.nextPrompt}</p>
    </aside>
  );
}
