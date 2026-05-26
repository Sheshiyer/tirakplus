import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { MuseConversationSummary, TravellerDashboardResponse } from "../../shared/contracts";
import { MuseService } from "../api/muse";
import { TravellerService } from "../api/traveller";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { CompanionPreviewCard } from "../components/ui/CompanionPreviewCard";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

const MUSE_STAGE_LABELS: Record<string, string> = {
  arrival: "Opening",
  birth_context: "Birth details",
  travel_context: "City and timing",
  desire_mapping: "Mood",
  safety_boundaries: "Boundaries",
  recommendation_ready: "Ready",
};

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: TravellerDashboardResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function TravellerDashboardPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [museThreads, setMuseThreads] = useState<MuseConversationSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    TravellerService.getDashboard()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Traveller dashboard could not be loaded.",
          });
        }
      });

    // Adopted Muse threads — silent on failure, surfaces only if any exist.
    MuseService.listConversations()
      .then((res) => {
        if (!cancelled) setMuseThreads(res.conversations);
      })
      .catch(() => {
        // Leave empty; the dashboard section just won't render.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="member-page">
        <div className="member-bento-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="member-page">
        <FeedbackState variant="error" title="Route board unavailable" description={state.message} />
      </section>
    );
  }

  const { data } = state;

  return (
    <section className="member-page traveller-dashboard-page" aria-labelledby="traveller-dashboard-title">
      <div className="member-hero">
        <div className="member-hero-copy">
          <p className="eyebrow">Today</p>
          <h1 id="traveller-dashboard-title">{data.greeting}</h1>
          <p>{data.summary}</p>
          <div className="action-row">
            <Button as={Link} to="/traveller/discovery" variant="primary">
              Open discovery
            </Button>
            <Button as={Link} to="/traveller/plans" variant="secondary">
              Review plans
            </Button>
          </div>
        </div>
        <aside className="member-route-support-card" aria-label="Muse route support">
          <MuseChartPanel chart={data.chart} compact />
          <div className="member-route-support-copy">
            <p className="eyebrow">Muse support</p>
            <h2>Keep the route calm.</h2>
            <p>{data.chart.nextPrompt}</p>
          </div>
          <Button as={Link} to="/" variant="secondary">
            Ask Muse
          </Button>
        </aside>
      </div>

      <div className="member-metric-grid" aria-label="Traveller route metrics">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="member-bento-card metric-card">
            <p className="meta">{metric.label}</p>
            <strong>{metric.value}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="member-bento-grid member-bento-grid-featured">
        <article className="member-bento-card member-bento-card-large">
          <p className="eyebrow">Inbox</p>
          <h2>{data.activeInquiry.companionDisplayName} inquiry</h2>
          <p>{data.activeInquiry.nextStep}</p>
          <div className="status-pill-row">
            <span>{data.activeInquiry.city.replace(/-/g, " ")}</span>
            <span>{data.activeInquiry.experience.replace(/-/g, " ")}</span>
            <span>{data.activeInquiry.status.replace(/_/g, " ")}</span>
          </div>
          <Button as={Link} to={`/traveller/inbox/${data.activeInquiry.id}`} variant="secondary">
            Open inquiry
          </Button>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Next plan</p>
          <h2>{data.upcomingSession.routeLabel}</h2>
          <p>{data.upcomingSession.nextStep}</p>
          <div className="status-pill-row">
            <span>{data.upcomingSession.companionDisplayName}</span>
            <span>{data.upcomingSession.status.replace(/_/g, " ")}</span>
          </div>
          <Button as={Link} to={`/traveller/plans/${data.upcomingSession.id}`} variant="secondary">
            View plan
          </Button>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Helpful cues</p>
          <ul className="member-note-list">
            {data.guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      {museThreads.length > 0 ? (
        <section className="member-section" aria-labelledby="muse-threads-title">
          <div className="member-section-heading">
            <p className="eyebrow">Muse threads</p>
            <h2 id="muse-threads-title">Continue a private read</h2>
          </div>
          <div className="member-bento-grid">
            {museThreads.slice(0, 6).map((thread) => (
              <article key={thread.conversationId} className="member-bento-card">
                <p className="meta">{MUSE_STAGE_LABELS[thread.stage] ?? thread.stage}</p>
                <p>
                  {thread.lastMessageRole === "muse" ? "Muse: " : "You: "}
                  {thread.lastMessagePreview}
                  {thread.lastMessagePreview.length >= 140 ? "…" : ""}
                </p>
                <div className="status-pill-row">
                  <span>{thread.messageCount} message{thread.messageCount === 1 ? "" : "s"}</span>
                  <span>{new Date(thread.adoptedAt).toLocaleDateString()}</span>
                </div>
                <Button as={Link} to={`/?resume=${encodeURIComponent(thread.conversationId)}`} variant="secondary">
                  Continue thread
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="member-section" aria-labelledby="saved-profiles-title">
        <div className="member-section-heading">
          <p className="eyebrow">Saved profiles</p>
          <h2 id="saved-profiles-title">Saved profiles</h2>
        </div>
        <div className="discovery-results-grid">
          {data.savedProfiles.map((profile) => (
            <Link key={profile.id} className="discovery-card-link" to={`/traveller/companions/${profile.id}`}>
              <CompanionPreviewCard profile={profile} />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
