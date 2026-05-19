import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { TravellerSessionDetail } from "../../shared/contracts";
import { TravellerService } from "../api/traveller";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; session?: undefined; message?: undefined }
  | { status: "ready"; session: TravellerSessionDetail; message?: undefined }
  | { status: "error"; session?: undefined; message: string };

export function TravellerSessionDetailPage() {
  const { sessionId } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", message: "Plan route is missing an identifier." });
      return;
    }

    let cancelled = false;
    TravellerService.getSession(sessionId)
      .then((session) => {
        if (!cancelled) setState({ status: "ready", session });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Plan detail could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.status === "loading") {
    return (
      <section className="member-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="member-page">
        <FeedbackState
          variant="error"
          title="Plan unavailable"
          description={state.message}
          actionLabel="Back to plans"
          onAction={() => window.location.assign("/traveller/plans")}
        />
      </section>
    );
  }

  const { session } = state;

  return (
    <section className="member-page traveller-session-detail-page" aria-labelledby="traveller-session-title">
      <div className="member-hero">
        <div className="member-hero-copy">
          <p className="eyebrow">{session.status.replace(/_/g, " ")}</p>
          <h1 id="traveller-session-title">{session.routeLabel}</h1>
          <p>{session.nextStep}</p>
          <div className="status-pill-row">
            <span>{session.companionDisplayName}</span>
            <span>{session.city.replace(/-/g, " ")}</span>
            <span>{session.venueArea}</span>
          </div>
        </div>
        <div className="member-muse-card">
          <MusePoseImage variant="thinking" label="Muse holding the plan in review" />
          <MuseChartPanel chart={session.museRead} compact />
        </div>
      </div>

      <div className="member-bento-grid member-bento-grid-featured">
        <article className="member-bento-card member-bento-card-large">
          <p className="eyebrow">Itinerary state</p>
          <div className="session-checklist">
            {session.itinerary.map((item) => (
              <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
                <p className="meta">{item.status}</p>
                <h2>{item.label}</h2>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Muse thread</p>
          <div className="message-thread">
            {session.messageThread.map((message) => (
              <p key={message.id} className={`message-bubble message-bubble-${message.role}`}>
                {message.content}
              </p>
            ))}
          </div>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Payment gate</p>
          <h2>{session.paymentState.status.replace(/_/g, " ")}</h2>
          <p>{session.paymentState.note}</p>
        </article>
      </div>

      <section className="member-bento-card member-safety-panel">
        <div>
          <p className="eyebrow">Privacy and safety</p>
          <h2>{session.privacyNote}</h2>
        </div>
        <ul>
          {session.safetyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <div className="action-row">
        <Button as={Link} to="/traveller/plans" variant="secondary">
          Back to plans
        </Button>
        <Button as={Link} to={`/traveller/inbox/${session.inquiryId}`} variant="secondary">
          Open inquiry
        </Button>
      </div>
    </section>
  );
}
