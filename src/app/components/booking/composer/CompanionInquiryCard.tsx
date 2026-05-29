/**
 * CompanionInquiryCard — sidebar profile card for the inquiry composer.
 *
 * P2.T3 (2026-05-28). Presentational. Renders a compact portrait + name +
 * verified/city chips + a short tone/bio line. Sits in the composer's
 * left rail; the holistic 3-col layout is T6's job.
 *
 * Field reality (vs the T3 spec, which assumed a `verification.approved`
 * boolean): `CompanionProfile` carries `verificationState` (the
 * "approved" | "pending_verification" | "changes_requested" enum from
 * `CompanionPreview`) and a `verification` object that is `{ label,
 * reviewNote }` — NOT a boolean. So "verified" is derived from
 * `verificationState === "approved"`, and the verified chip's label is
 * sourced from `verification.label` when present.
 */
import type { CompanionProfile } from "../../../../shared/contracts";
import { Chip } from "../../ui/Chip";

const CITY_LABELS: Record<CompanionProfile["city"], string> = {
  bangkok: "Bangkok",
  phuket: "Phuket",
  "koh-samui": "Koh Samui",
  "koh-phangan": "Koh Phangan",
};

const PinIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const VerifiedIcon = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 1.4 9.9 3l2.5-.2.5 2.4 2 1.5-1.2 2.2 1.2 2.2-2 1.5-.5 2.4-2.5-.2L8 14.6 6.1 13l-2.5.2-.5-2.4-2-1.5 1.2-2.2L1.1 4.9l2-1.5.5-2.4L6.1 3 8 1.4Z"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    <path
      d="m5.6 8 1.6 1.6L10.6 6"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type CompanionInquiryCardProps = {
  profile: CompanionProfile;
};

export function CompanionInquiryCard({ profile }: CompanionInquiryCardProps) {
  const isVerified = profile.verificationState === "approved";
  const verifiedLabel = profile.verification?.label ?? "Verified";
  const cityLabel = CITY_LABELS[profile.city] ?? profile.city;
  // Prefer the curated tone line; fall back to a trimmed bio so the card is
  // never empty even on sparse fixtures.
  const toneLine = profile.profileTone?.trim() || profile.bio?.trim() || "";

  const initials = profile.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className="composer-companion-card" aria-label={`Inquiry to ${profile.displayName}`}>
      <div className="composer-companion-card__head">
        <div className="composer-companion-card__avatar" aria-hidden={profile.avatarUrl ? undefined : true}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" loading="lazy" />
          ) : (
            <span className="composer-companion-card__initials">{initials || "TK"}</span>
          )}
        </div>
        <div className="composer-companion-card__identity">
          <p className="composer-companion-card__name">{profile.displayName}</p>
          <div className="composer-companion-card__chips">
            {isVerified ? (
              <Chip variant="verified" icon={VerifiedIcon}>
                {verifiedLabel}
              </Chip>
            ) : null}
            <Chip variant="location" icon={PinIcon}>
              {cityLabel}
            </Chip>
          </div>
        </div>
      </div>

      {toneLine ? <p className="composer-companion-card__tone">{toneLine}</p> : null}
    </article>
  );
}
