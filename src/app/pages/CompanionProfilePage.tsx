// CompanionProfilePage.tsx — P1.T2 (2026-05-28).
//
// Full rebuild to match the inspiration board at:
//   generated/web-reference-boards/gpt-image-2/companion-profile-responsive-board.png
//
// Layout shape:
//   - Topbar with back chevron + "Tirak Plus" wordmark
//   - Portrait-led hero (4:5 ratio dominant)
//   - Name (display) + inline verified check, chip row, bio
//   - <1024px: stacked availability + experiences sections
//   - >=1024px: 2-col grid — availability + experiences left, sidebar
//     ("Ready to connect?" + mirrored summaries) right
//   - Below the fold: safety panel + reviews list (preserved, restyled)
//   - Sticky coral "Inquire" CTA fixed to viewport bottom on every
//     breakpoint, with "Private inquiry" microcopy strip above
//
// All visual styling is page-scoped under .companion-profile-v2 so the
// existing .member-shell .profile-* light cascade is bypassed without
// touching global tokens.
//
// MuseChartPanel was removed (not in board — same 4-card cruft we
// removed from MuseChatPage on 2026-05-27).

import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  CompanionProfile,
  CompanionRatingAggregate,
  ReviewSummary,
} from "../../shared/contracts";
import { BookingService } from "../api/booking";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { AssetRegistry } from "../registry/assets";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonProfile } from "../components/ui/Skeleton";

type ProfileState =
  | { status: "loading"; profile?: undefined; message?: undefined; unavailable?: undefined }
  | { status: "ready"; profile: CompanionProfile; message?: undefined; unavailable?: undefined }
  | { status: "error"; profile?: undefined; message: string; unavailable: boolean };

type ReviewsState =
  | { status: "loading" }
  | { status: "ready"; aggregate: CompanionRatingAggregate; reviews: ReviewSummary[] }
  | { status: "error"; message: string };

export function CompanionProfilePage() {
  const { companionId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [reviewsState, setReviewsState] = useState<ReviewsState>({ status: "loading" });

  useEffect(() => {
    if (!companionId) {
      setState({ status: "error", message: "Profile route is missing an identifier.", unavailable: true });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getProfile(companionId)
      .then((profile) => {
        if (!cancelled) setState({ status: "ready", profile });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const unavailable = error instanceof ApiRequestError && (error.status === 404 || error.status === 423);
          setState({
            status: "error",
            unavailable,
            message: error instanceof Error ? error.message : "This profile is unavailable.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  useEffect(() => {
    if (!companionId) return;

    let cancelled = false;
    setReviewsState({ status: "loading" });

    BookingService.getCompanionReviews(companionId)
      .then((res) => {
        if (!cancelled) {
          setReviewsState({ status: "ready", aggregate: res.aggregate, reviews: res.reviews });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReviewsState({
            status: "error",
            message: err instanceof Error ? err.message : "Reviews unavailable.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  if (state.status === "loading") {
    return (
      <section className="companion-profile-v2 companion-profile-v2-loading">
        <SkeletonProfile />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="companion-profile-v2 companion-profile-v2-error">
        <FeedbackState
          variant={state.unavailable ? "empty" : "error"}
          title={state.unavailable ? "Profile is not available" : "Profile could not load"}
          description={state.message}
          actionLabel="Back to discovery"
          onAction={() => window.location.assign("/traveller/discovery")}
        />
      </section>
    );
  }

  const { profile } = state;
  const primaryExperience = profile.experienceTags[0];
  const canSendInquiry = profile.visibilityState === "public" && Boolean(primaryExperience);
  const isApproved = profile.verificationState === "approved";
  const cityLabel = profile.city.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const portraitUrl = AssetRegistry.resolveAsset("profile", profile.avatarUrl);

  return (
    <section
      className="companion-profile-v2"
      data-companion-id={profile.id}
      aria-labelledby="profile-title"
    >
      <header className="profile-topbar-v2">
        <Link
          to="/traveller/discovery"
          className="profile-topbar-back"
          aria-label="Back to discovery"
        >
          <BackChevron />
        </Link>
        <span className="profile-topbar-brand">Tirak Plus</span>
        {/* Right spacer keeps brand visually centered without an extra element. */}
        <span className="profile-topbar-spacer" aria-hidden="true" />
      </header>

      <div className="profile-hero-v2">
        <div className="profile-portrait-v2">
          <img src={portraitUrl} alt="" />
        </div>
        <div className="profile-identity">
          <h1 id="profile-title" className="profile-display-name">
            <span>{profile.displayName}</span>
            {isApproved && <VerifiedSeal />}
          </h1>
          <div className="profile-chip-row">
            <Chip variant="location" icon={<PinIcon />}>
              {cityLabel}
            </Chip>
            {isApproved && (
              <Chip variant="verified" icon={<CheckIcon />}>
                ID Verified
              </Chip>
            )}
          </div>
          <p className="profile-bio-v2">{profile.bio}</p>
          {reviewsState.status === "ready" && reviewsState.aggregate.reviewCount > 0 && (
            <div
              className="profile-rating-badge"
              aria-label={`Rated ${reviewsState.aggregate.averageScore} out of 5 from ${reviewsState.aggregate.reviewCount} review${reviewsState.aggregate.reviewCount === 1 ? "" : "s"}`}
            >
              <StarIcon />
              <span className="profile-rating-score">
                {reviewsState.aggregate.averageScore.toFixed(1)}
              </span>
              <span className="profile-rating-divider" aria-hidden="true">·</span>
              <span className="profile-rating-count">
                {reviewsState.aggregate.reviewCount} review
                {reviewsState.aggregate.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-detail-v2-grid">
        <section className="profile-availability-v2" aria-labelledby="availability-heading">
          <p className="eyebrow">Date &amp; time</p>
          <h2 id="availability-heading">Availability</h2>
          <ul className="profile-availability-list">
            {profile.availabilityWindows.map((window) => (
              <li
                key={window.id}
                className={`profile-availability-row profile-availability-row-${window.status}`}
              >
                <span className="profile-availability-dot" aria-hidden="true" />
                <div className="profile-availability-meta">
                  <p className="profile-availability-label">{window.label}</p>
                  <p className="profile-availability-note">{window.note}</p>
                </div>
                <span className="profile-availability-status">
                  {window.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="profile-experiences-v2" aria-labelledby="experiences-heading">
          <p className="eyebrow">Experiences</p>
          <h2 id="experiences-heading">What we can do together</h2>
          <ul className="profile-experiences-list">
            {profile.experienceFit.map((fit) => (
              <li key={fit.slug} className="profile-experience-tag">
                <span className="profile-experience-tag-bullet" aria-hidden="true">◆</span>
                <div>
                  <p className="profile-experience-tag-title">{fit.title}</p>
                  <p className="profile-experience-tag-note">{fit.fitNote}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="profile-sidebar-v2" aria-label="Connection summary">
          <div className="profile-ready-card">
            <p className="eyebrow profile-ready-eyebrow">Ready to connect?</p>
            <p className="profile-ready-line">{profile.availabilitySummary}</p>
            <p className="profile-ready-tone">{profile.profileTone}</p>
          </div>

          <div className="profile-sidebar-summary">
            <p className="eyebrow">Availability</p>
            <ul>
              {profile.availabilityWindows.slice(0, 3).map((window) => (
                <li key={window.id}>
                  <span className={`profile-sidebar-dot profile-sidebar-dot-${window.status}`} aria-hidden="true" />
                  <span>{window.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="profile-sidebar-summary">
            <p className="eyebrow">Experiences</p>
            <ul>
              {profile.experienceFit.slice(0, 5).map((fit) => (
                <li key={fit.slug}>
                  <span className="profile-sidebar-dot profile-sidebar-dot-experience" aria-hidden="true" />
                  <span>{fit.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="profile-safety-v2" aria-labelledby="profile-safety-heading">
        <p className="eyebrow">First message</p>
        <h2 id="profile-safety-heading">{profile.safetyNote}</h2>
        <ul className="profile-safety-list">
          {profile.inquiryGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button as={Link} to="/traveller/safety" variant="secondary">
          Open safety
        </Button>
      </section>

      {reviewsState.status === "ready" && reviewsState.reviews.length > 0 && (
        <section className="profile-reviews-v2" aria-label="Recent reviews">
          <p className="eyebrow">Recent reviews</p>
          <ul className="profile-reviews-list-v2">
            {reviewsState.reviews.slice(0, 3).map((review) => (
              <li key={review.bookingId} className="profile-reviews-item-v2">
                <div className="profile-reviews-header-v2">
                  <span
                    className="profile-reviews-score-v2"
                    aria-label={`Score ${review.score} out of 5`}
                  >
                    {review.score}/5
                  </span>
                  <span className="profile-reviews-divider-v2" aria-hidden="true">·</span>
                  <span className="profile-reviews-label-v2">{review.travellerLabel}</span>
                </div>
                <p className="profile-reviews-comment-v2">"{review.comment}"</p>
                <p className="profile-reviews-date-v2">{formatDate(review.submittedAt)}</p>
              </li>
            ))}
          </ul>
          {reviewsState.reviews.length > 3 && (
            <p className="profile-reviews-more-v2">
              + {reviewsState.reviews.length - 3} more review
              {reviewsState.reviews.length - 3 === 1 ? "" : "s"}.
            </p>
          )}
        </section>
      )}

      {reviewsState.status === "ready" && reviewsState.reviews.length === 0 && (
        <section className="profile-reviews-v2 profile-reviews-empty-v2" aria-label="No reviews yet">
          <p className="eyebrow">Reviews</p>
          <p>No reviews yet.</p>
        </section>
      )}

      {/* Sticky bottom CTA — pinned to viewport, dark backdrop with blur.
          Hidden when the profile can't take inquiries so we don't dangle a
          dead button (visibilityState !== "public" or no experience tags).

          P2.T5 — the CTA now routes to the full-page InquiryComposerPage
          (/traveller/companions/:id/inquire) instead of opening the old
          InquiryFormSheet / InquiryConversation <dialog>. The composer owns
          date/time/experience/location/message + submit; this page no longer
          hosts the inquiry modal. */}
      {canSendInquiry && (
        <div className="profile-sticky-cta" role="region" aria-label="Send inquiry">
          <p className="profile-sticky-cta-microcopy">Private inquiry</p>
          <Button
            type="button"
            variant="coral"
            fullWidth
            onClick={() => navigate(`/traveller/companions/${profile.id}/inquire`)}
          >
            Inquire
          </Button>
        </div>
      )}
    </section>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Inline SVG glyphs — lucide-react isn't installed; these are intentionally
// tiny so they stay maintainable beside the markup that uses them.
// ---------------------------------------------------------------------------

function BackChevron(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
      <path d="M12.5 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedSeal(): ReactNode {
  // Filled coral disc + inset checkmark, sized to sit on the name baseline.
  return (
    <span className="profile-verified-seal" aria-label="Verified" title="ID verified">
      <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M7.5 12.4l3 3 6-7" stroke="#16101e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function PinIcon(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
      <path d="M10 17s5-4.6 5-9a5 5 0 10-10 0c0 4.4 5 9 5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.4l2.5 2.4 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true" className="profile-rating-star">
      <path
        d="M10 2.5l2.36 4.78 5.27.77-3.82 3.72.9 5.26L10 14.55l-4.71 2.48.9-5.26L2.37 8.05l5.27-.77L10 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}
