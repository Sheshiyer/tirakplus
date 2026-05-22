import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CompanionDashboardResponse, CompanionReviewStatus } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionDashboardResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function CompanionDashboardPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    CompanionService.getDashboard()
      .then((data) => {
        if (!cancelled) setLoadState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : "Companion dashboard could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState.status === "loading") {
    return (
      <section className="companion-page">
        <SkeletonCard />
      </section>
    );
  }

  if (loadState.status === "error") {
    return (
      <section className="companion-page">
        <FeedbackState
          variant="error"
          title="Dashboard unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  const { profile, progress, panels, reviewStates, safetyGuidance } = loadState.data;
  const activeReviewState = reviewStates.find((state) => state.status === profile.reviewStatus);

  return (
    <section className="companion-page companion-dashboard-page" aria-labelledby="companion-dashboard-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Companion workspace</p>
          <h1 id="companion-dashboard-title">Set your visibility before discovery.</h1>
          <p>
            Your profile, availability, and inquiries stay private until review and your visibility settings allow them
            to appear.
          </p>
        </div>
        <div className={`review-state-card review-state-card-${profile.reviewStatus}`}>
          <MuseChartPanel chart={loadState.data.chart} compact />
          <p className="meta">Current state</p>
          <h2>{activeReviewState?.label || statusLabel(profile.reviewStatus)}</h2>
          <p>{profile.reviewNote}</p>
          <p className="progress-label">{progress.label}</p>
        </div>
      </div>

      <div className="companion-action-grid">
        {panels.map((panel) => (
          <article key={panel.href} className="companion-action-card">
            <div>
              <h2>{panel.title}</h2>
              <p>{panel.description}</p>
            </div>
            <Button as={Link} to={panel.href} variant="secondary">
              Open
            </Button>
          </article>
        ))}
      </div>

      <section className="companion-section companion-review-section" aria-labelledby="review-states-title">
        <div className="companion-section-heading">
          <p className="eyebrow">Review</p>
          <h2 id="review-states-title">Know what travellers can see.</h2>
        </div>
        <div className="review-state-grid">
          {reviewStates.map((state) => (
            <article key={state.status} className={`review-state-card review-state-card-${state.status}`}>
              <p className="meta">{state.status.replace(/_/g, " ")}</p>
              <h3>{state.label}</h3>
              <p>{state.description}</p>
              <p className="review-action">{state.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="companion-safety-band" aria-labelledby="companion-safety-title">
        <div>
          <p className="eyebrow">Companion safety</p>
          <h2 id="companion-safety-title">Keep boundaries easy to act on.</h2>
        </div>
        <ul>
          {safetyGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function statusLabel(status: CompanionReviewStatus): string {
  return status.replace(/_/g, " ");
}
