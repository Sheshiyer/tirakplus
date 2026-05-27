import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type {
  CompanionProfile,
  CompanionRatingAggregate,
  ReviewSummary,
} from "../../shared/contracts";
import { BookingService } from "../api/booking";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { AssetRegistry } from "../registry/assets";
import { InquiryFormSheet } from "../components/booking/InquiryFormSheet";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
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
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [reviewsState, setReviewsState] = useState<ReviewsState>({ status: "loading" });
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      <section className="profile-page">
        <SkeletonProfile />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="profile-page">
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

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-hero">
        <div>
          <p className="eyebrow">{profile.city.replace("-", " ")}</p>
          <h1 id="profile-title">{profile.displayName}</h1>
          {reviewsState.status === "ready" && reviewsState.aggregate.reviewCount > 0 && (
            <div
              className="companion-rating-badge"
              aria-label={`Rated ${reviewsState.aggregate.averageScore} out of 5 from ${reviewsState.aggregate.reviewCount} review${reviewsState.aggregate.reviewCount === 1 ? "" : "s"}`}
            >
              <span className="companion-rating-score">
                {reviewsState.aggregate.averageScore.toFixed(1)}
              </span>
              <span className="companion-rating-divider" aria-hidden="true">·</span>
              <span className="companion-rating-count">
                {reviewsState.aggregate.reviewCount} review
                {reviewsState.aggregate.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
          <p className="lede">{profile.profileTone}</p>
          <p className="profile-bio">{profile.bio}</p>
          <div className="action-row">
            {canSendInquiry && (
              <Button type="button" variant="primary" onClick={() => setInquiryOpen(true)}>
                Send inquiry
              </Button>
            )}
            <Button as={Link} to="/traveller/discovery" variant="secondary">
              Back to discovery
            </Button>
          </div>
          {statusMessage && (
            <p className="companion-status-message" role="status">
              {statusMessage}
            </p>
          )}
        </div>

        <aside className="profile-verification-panel" aria-label="Verification state">
          <div className="profile-portrait" aria-hidden="true">
            <img src={AssetRegistry.resolveAsset("profile", profile.avatarUrl)} alt="" />
          </div>
          <p className="meta">Verification</p>
          <h2>{profile.verification.label}</h2>
          <p>{profile.verification.reviewNote}</p>
        </aside>
      </div>

      <MuseChartPanel chart={profile.chart} className="profile-chart-panel" />

      <div className="profile-detail-grid">
        <section className="profile-detail-panel" aria-labelledby="availability-heading">
          <h2 id="availability-heading">Availability</h2>
          <div className="availability-list">
            {profile.availabilityWindows.map((window) => (
              <article key={window.id} className={`availability-item availability-item-${window.status}`}>
                <p className="meta">{window.status.replace("_", " ")}</p>
                <h3>{window.label}</h3>
                <p>{window.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-detail-panel" aria-labelledby="fit-heading">
          <h2 id="fit-heading">Experience fit</h2>
          <div className="experience-fit-list">
            {profile.experienceFit.map((fit) => (
              <article key={fit.slug} className="experience-fit-item">
                <h3>{fit.title}</h3>
                <p>{fit.fitNote}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="profile-safety-panel" aria-labelledby="profile-safety-heading">
        <div>
          <p className="eyebrow">First message</p>
          <h2 id="profile-safety-heading">{profile.safetyNote}</h2>
        </div>
        <ul>
          {profile.inquiryGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Button as={Link} to="/traveller/safety" variant="secondary">
          Open safety
        </Button>
      </section>

      {reviewsState.status === "ready" && reviewsState.reviews.length > 0 && (
        <section className="companion-reviews" aria-label="Recent reviews">
          <p className="eyebrow">Recent reviews</p>
          <ul className="companion-reviews-list">
            {reviewsState.reviews.slice(0, 3).map((review) => (
              <li key={review.bookingId} className="companion-reviews-item">
                <div className="companion-reviews-header">
                  <span
                    className="companion-reviews-score"
                    aria-label={`Score ${review.score} out of 5`}
                  >
                    {review.score}/5
                  </span>
                  <span className="companion-reviews-divider" aria-hidden="true">·</span>
                  <span className="companion-reviews-label">{review.travellerLabel}</span>
                </div>
                <p className="companion-reviews-comment">"{review.comment}"</p>
                <p className="companion-reviews-date">{formatDate(review.submittedAt)}</p>
              </li>
            ))}
          </ul>
          {reviewsState.reviews.length > 3 && (
            <p className="companion-reviews-more meta">
              + {reviewsState.reviews.length - 3} more review
              {reviewsState.reviews.length - 3 === 1 ? "" : "s"}.
            </p>
          )}
        </section>
      )}

      {reviewsState.status === "ready" && reviewsState.reviews.length === 0 && (
        <section className="companion-reviews companion-reviews-empty" aria-label="No reviews yet">
          <p className="eyebrow">Reviews</p>
          <p>No reviews yet.</p>
        </section>
      )}

      {canSendInquiry && primaryExperience && (
        <InquiryFormSheet
          open={inquiryOpen}
          companionId={profile.id}
          companionDisplayName={profile.displayName}
          city={profile.city}
          experience={primaryExperience}
          onClose={() => setInquiryOpen(false)}
          onSubmitted={() => {
            setInquiryOpen(false);
            setStatusMessage(`Inquiry sent to ${profile.displayName}. Check your inbox.`);
          }}
        />
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
