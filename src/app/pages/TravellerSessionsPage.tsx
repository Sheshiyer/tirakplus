import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { TravellerSessionListResponse } from "../../shared/contracts";
import { TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: TravellerSessionListResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function TravellerSessionsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    TravellerService.getSessions()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Plans could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="member-page traveller-sessions-page" aria-labelledby="traveller-sessions-title">
      <div className="member-hero member-hero-compact">
        <div>
          <p className="eyebrow">Plans and sessions</p>
          <h1 id="traveller-sessions-title">Reviewed routes, bookings, and next steps.</h1>
          <p>
            Plans collect Muse context, companion fit, privacy state, and payment gates. They are not public bookings or
            instant confirmations.
          </p>
        </div>
      </div>

      {state.status === "loading" && (
        <div className="member-bento-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state.status === "error" && <FeedbackState variant="error" title="Plans unavailable" description={state.message} />}

      {state.status === "ready" &&
        (state.data.results.length === 0 ? (
          <FeedbackState
            title={state.data.emptyState.title}
            description={state.data.emptyState.description}
            actionLabel="Open discovery"
            onAction={() => window.location.assign("/traveller/discovery")}
          />
        ) : (
          <div className="session-card-list">
            {state.data.results.map((session) => (
              <article key={session.id} className="member-bento-card session-summary-card">
                <div className="session-summary-media" aria-hidden="true">
                  {session.companionAvatarUrl ? <img src={session.companionAvatarUrl} alt="" /> : null}
                </div>
                <div>
                  <p className="meta">{session.status.replace(/_/g, " ")}</p>
                  <h2>{session.routeLabel}</h2>
                  <p>{session.nextStep}</p>
                  <div className="status-pill-row">
                    <span>{session.companionDisplayName}</span>
                    <span>{session.city.replace(/-/g, " ")}</span>
                    <span>{session.experience.replace(/-/g, " ")}</span>
                  </div>
                </div>
                <Button as={Link} to={`/traveller/plans/${session.id}`} variant="secondary">
                  Open
                </Button>
              </article>
            ))}
          </div>
        ))}
    </section>
  );
}
