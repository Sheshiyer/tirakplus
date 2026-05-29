import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CompanionDashboardResponse, CompanionReviewStatus } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
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
          <p className="eyebrow">Today</p>
          <h1 id="companion-dashboard-title">
            {profile.reviewStatus === "approved"
              ? "Your profile is open"
              : profile.reviewStatus === "pending_verification" || profile.reviewStatus === "changes_requested"
              ? "Profile in review"
              : profile.reviewStatus === "rejected"
              ? "Review needs another pass"
              : "Prepare your profile"}
          </h1>
          <p>
            {profile.reviewStatus === "approved"
              ? "Review open inquiries, tune availability, and keep boundaries clear."
              : "Edit your profile, choose when you are open, and keep requests paused until everything feels clear."}
          </p>
        </div>
        <div className={`review-state-card review-state-card-${profile.reviewStatus}`}>
          <MuseChartPanel chart={loadState.data.chart} compact />
          <p className="meta">Now</p>
          <h2>{activeReviewState?.label || statusLabel(profile.reviewStatus)}</h2>
          <p>{profile.reviewNote}</p>
          <p className="progress-label">{progress.label}</p>
        </div>
      </div>

      <div className="companion-action-grid">
        {panels.map((panel) => (
          <Link key={panel.href} to={panel.href} className="companion-action-card">
            <span className="companion-action-card-icon" aria-hidden="true">
              {actionIcon(panel.href)}
            </span>
            <div className="companion-action-card-body">
              <h2>{panel.title}</h2>
              <p>{panel.description}</p>
            </div>
            <span className="companion-action-card-cta">
              Open
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>

      <section className="companion-section companion-review-section" aria-labelledby="review-states-title">
        <div className="companion-section-heading">
          <p className="eyebrow">Review</p>
          <h2 id="review-states-title">Control what travellers can see.</h2>
        </div>
        <div className="review-state-grid">
          {reviewStates.map((state) => (
            <article key={state.status} className={`review-state-card review-state-card-${state.status}`}>
              <p className="meta">
                <span className={`review-state-dot review-state-dot-${state.status}`} aria-hidden="true" />
                {state.status.replace(/_/g, " ")}
              </p>
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

// Route-mapped line icons for the action cards. Inline SVG mirrors the
// CompanionProfilePage icon pattern (stroke=currentColor) so the dashboard
// speaks the same visual vocabulary without a new icon dependency.
function actionIcon(href: string): ReactNode {
  if (href.includes("/plans") || href.includes("/availability")) return <CalendarIcon />;
  if (href.includes("/inbox") || href.includes("/inquir")) return <InboxIcon />;
  return <ProfileIcon />;
}

function ProfileIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.5c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function InboxIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true">
      <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 12.5h4l1.5 2.5h5l1.5-2.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon(): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden="true">
      <path d="M4.5 10h10M10.5 5.5 15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
