import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CompanionInquiryListResponse } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionInquiryListResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function CompanionInboxPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    CompanionService.getInquiries()
      .then((data) => {
        if (!cancelled) setLoadState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : "Companion inquiries could not be loaded.",
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
          title="Inbox unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  const { results, emptyState } = loadState.data;

  return (
    <section className="companion-page companion-inbox-page" aria-labelledby="companion-inbox-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Private inquiries</p>
          <h1 id="companion-inbox-title">Review traveller requests when checks are complete.</h1>
          <p>
            Inquiries show planning context first. Contact details and payment actions stay private until the request
            is ready.
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <FeedbackState title={emptyState.title} description={emptyState.description} />
      ) : (
        <div className="companion-inquiry-list">
          {results.map((inquiry) => (
            <article key={inquiry.id} className="companion-inquiry-card">
              <div>
                <p className="meta">{inquiry.status.replace(/_/g, " ")}</p>
                <h2>{inquiry.travellerLabel}</h2>
                <p>{inquiry.nextStep}</p>
              </div>
              <div className="preview-meta-grid">
                <span>{inquiry.city.replace(/-/g, " ")}</span>
                <span>{inquiry.experience.replace(/-/g, " ")}</span>
                <span>{inquiry.preferredWindow}</span>
              </div>
              <p className="privacy-note">{inquiry.privacyNote}</p>
              <Button as={Link} to={`/companion/inbox/${inquiry.id}`} variant="secondary">
                Review
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
