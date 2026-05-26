import type { MuseChartSignature } from "../../../shared/contracts";

type MuseChartPanelProps = {
  chart: MuseChartSignature;
  compact?: boolean;
  className?: string;
};

/**
 * "Muse's Read" — premium observational card (2026-05-26 redesign).
 *
 * Visual concept: a single embossed dossier panel with champagne-bronze
 * hairline edges instead of the previous flat-glass card. Drops the
 * duplicated tagline (now lives only on the page H1), drops the
 * freestanding orbit decoration, and renders the 2×2 axis tiles each
 * with their own gold hairline + label/value split. The footer "next"
 * line reads as a quiet aside, not a chat command.
 */
export function MuseChartPanel({ chart, compact = false, className = "" }: MuseChartPanelProps) {
  const classes = ["muse-chart-panel", compact ? "muse-chart-panel-compact" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={classes} aria-label={chart.title}>
      <header className="muse-chart-header">
        <p className="eyebrow muse-chart-eyebrow">{chart.title}</p>
        {/* Tagline + summary are intentionally NOT rendered inside the
            chart card any more — they duplicated the page H1 and the
            context-panel eyebrow. The card now reads as a tight dossier. */}
      </header>

      <div className="muse-chart-axis-grid">
        {chart.axes.map((axis) => (
          <div key={axis.label} className={`muse-chart-axis muse-chart-axis-${axis.tone}`}>
            <span>{axis.label}</span>
            <strong>{axis.value}</strong>
          </div>
        ))}
      </div>

      {!compact && chart.cues.length > 0 ? (
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
