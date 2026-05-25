import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CompanionSessionDetail } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionSessionDetail; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function CompanionInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Choose an inquiry before opening its details." });
      return;
    }

    let cancelled = false;
    CompanionService.getInquiry(inquiryId)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiry detail could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  if (state.status === "loading") {
    return (
      <section className="companion-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="companion-page">
        <FeedbackState
          variant="error"
          title="Inquiry unavailable"
          description={state.message}
          actionLabel="Back to inbox"
          onAction={() => window.location.assign("/companion/inbox")}
        />
      </section>
    );
  }

  const { data } = state;

  return (
    <section className="companion-page companion-inquiry-detail-page" aria-labelledby="companion-inquiry-detail-title">
      <div className="member-hero">
        <div className="member-hero-copy">
          <p className="eyebrow">{data.status.replace(/_/g, " ")}</p>
          <h1 id="companion-inquiry-detail-title">{data.travellerLabel}</h1>
          <p>{data.travellerContext}</p>
          <div className="status-pill-row">
            <span>{data.city.replace(/-/g, " ")}</span>
            <span>{data.experience.replace(/-/g, " ")}</span>
            <span>{data.preferredWindow}</span>
          </div>
        </div>
        <aside className="member-route-support-card" aria-label="Muse inquiry support">
          <MuseChartPanel chart={data.museFit} compact />
          <div className="member-route-support-copy">
            <p className="eyebrow">Muse fit</p>
            <h2>{data.museFit.summary}</h2>
            <p>{data.museFit.nextPrompt}</p>
          </div>
        </aside>
      </div>

      <div className="member-bento-grid member-bento-grid-featured">
        <article className="member-bento-card member-bento-card-large">
          <p className="eyebrow">Decision options</p>
          <div className="decision-grid">
            {data.decisionOptions.map((option) => (
              <button key={option.value} className="decision-card" type="button">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Review checklist</p>
          <div className="session-checklist">
            {data.checklist.map((item) => (
              <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
                <p className="meta">{item.status}</p>
                <h2>{item.label}</h2>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="member-bento-card">
          <p className="eyebrow">Muse reply help</p>
          <div className="message-thread">
            {data.messageThread.map((message) => (
              <p key={message.id} className={`message-bubble message-bubble-${message.role}`}>
                {message.content}
              </p>
            ))}
          </div>
        </article>
      </div>

      <section className="member-bento-card member-safety-panel">
        <div>
          <p className="eyebrow">Payment and privacy</p>
          <h2>{data.paymentState.status.replace(/_/g, " ")}</h2>
          <p>{data.paymentState.note}</p>
        </div>
        <p>{data.privacyNote}</p>
      </section>

      <div className="action-row">
        <Button as={Link} to="/companion/inbox" variant="secondary">
          Back to inbox
        </Button>
        <Button as={Link} to="/companion/plans" variant="secondary">
          Availability
        </Button>
      </div>
    </section>
  );
}
