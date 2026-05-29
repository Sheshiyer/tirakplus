/**
 * DiscreetByDesignCard — static reassurance callout for the inquiry composer.
 *
 * P2.T3 (2026-05-28). Presentational, no interactivity. Shield icon +
 * "Discreet by design" heading + a one-line privacy promise. Lives in the
 * composer's right rail next to the session summary; T6 owns placement.
 */

export type DiscreetByDesignCardProps = {
  className?: string;
};

const ShieldIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2.5 4.5 5.6v5.2c0 4.6 3.1 8.9 7.5 10.7 4.4-1.8 7.5-6.1 7.5-10.7V5.6L12 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m8.8 11.8 2.2 2.2 4.2-4.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function DiscreetByDesignCard({ className = "" }: DiscreetByDesignCardProps) {
  const classes = ["composer-discreet-card", className].filter(Boolean).join(" ");
  return (
    <aside className={classes} aria-label="Discreet by design">
      <span className="composer-discreet-card__icon" aria-hidden="true">
        {ShieldIcon}
      </span>
      <div className="composer-discreet-card__body">
        <p className="composer-discreet-card__heading">Discreet by design</p>
        <p className="composer-discreet-card__text">
          Details are shared only after acceptance.
        </p>
      </div>
    </aside>
  );
}
