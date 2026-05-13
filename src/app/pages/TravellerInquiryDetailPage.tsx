import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { TravellerInquiryDetail } from "../../shared/contracts";
import { TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; inquiry?: undefined; message?: undefined }
  | { status: "ready"; inquiry: TravellerInquiryDetail; message?: undefined }
  | { status: "error"; inquiry?: undefined; message: string };

export function TravellerInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Inquiry route is missing an identifier." });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getInquiry(inquiryId)
      .then((inquiry) => {
        if (!cancelled) setState({ status: "ready", inquiry });
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
      <section className="inquiry-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="inquiry-page">
        <FeedbackState
          variant="error"
          title="Inquiry detail is unavailable"
          description={state.message}
          actionLabel="Back to inbox"
          onAction={() => window.location.assign("/traveller/inbox")}
        />
      </section>
    );
  }

  const { inquiry } = state;

  return (
    <section className="inquiry-page" aria-labelledby="inquiry-detail-title">
      <div className="inquiry-success-panel">
        <p className="eyebrow">{inquiry.status.replace("_", " ")}</p>
        <h1 id="inquiry-detail-title">{inquiry.companionDisplayName} inquiry</h1>
        <p>{inquiry.nextStep}</p>

        <div className="inquiry-detail-message">
          <h2>Traveller context</h2>
          <p>{inquiry.message}</p>
        </div>

        <div className="inquiry-timeline">
          {inquiry.timeline.map((item) => (
            <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
              <p className="meta">{item.status}</p>
              <h3>{item.label}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>

        <div className="payment-state-panel">
          <p className="meta">Payment state</p>
          <h2>{inquiry.paymentState.status.replace(/_/g, " ")}</h2>
          <p>{inquiry.paymentState.note}</p>
        </div>

        <p className="privacy-note">{inquiry.privacyNote}</p>

        <div className="action-row">
          <Button as={Link} to="/traveller/inbox" variant="secondary">
            Back to inbox
          </Button>
          <Button as={Link} to="/traveller/discovery" variant="secondary">
            Open discovery
          </Button>
        </div>
      </div>
    </section>
  );
}
