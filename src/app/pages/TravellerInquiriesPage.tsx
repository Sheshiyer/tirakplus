import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { TravellerInquiryListResponse } from "../../shared/contracts";
import { TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: TravellerInquiryListResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function TravellerInquiriesPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getInquiries()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiries could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="inquiry-page" aria-labelledby="inquiries-title">
      <div className="inquiry-heading">
        <p className="eyebrow">Traveller inbox</p>
        <h1 id="inquiries-title">Your conversations.</h1>
        <p>Review open requests, timing, and next steps in one place.</p>
      </div>

      {state.status === "loading" && (
        <div className="inquiry-card-list">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state.status === "error" && (
        <FeedbackState
          variant="error"
          title="Inbox is unavailable"
          description={state.message}
        />
      )}

      {state.status === "ready" && (
        state.data.results.length === 0 ? (
          <FeedbackState
            title={state.data.emptyState.title}
            description={state.data.emptyState.description}
            actionLabel="Open discovery"
            onAction={() => window.location.assign("/traveller/discovery")}
          />
        ) : (
          <div className="inquiry-card-list">
            {state.data.results.map((inquiry) => (
              <article key={inquiry.id} className="inquiry-summary-card">
                <div>
                  <p className="meta">{inquiry.status.replace("_", " ")}</p>
                  <h2>{inquiry.companionDisplayName}</h2>
                  <p>{inquiry.nextStep}</p>
                </div>
                <div className="inquiry-summary-meta">
                  <span>{inquiry.city.replace("-", " ")}</span>
                  <span>{inquiry.experience.replace(/-/g, " ")}</span>
                </div>
                <Button as={Link} to={`/traveller/inbox/${inquiry.id}`} variant="secondary">
                  Open thread
                </Button>
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}
