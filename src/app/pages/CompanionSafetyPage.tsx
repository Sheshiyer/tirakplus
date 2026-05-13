import { useEffect, useState } from "react";
import type { CompanionDashboardResponse } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionDashboardResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function CompanionSafetyPage() {
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
            message: error instanceof Error ? error.message : "Companion safety guidance could not be loaded.",
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
          title="Safety guidance unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  return (
    <section className="companion-page companion-safety-page" aria-labelledby="companion-safety-page-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Companion safety</p>
          <h1 id="companion-safety-page-title">Visibility, review, and boundaries are enforced in the workflow.</h1>
          <p>
            Tirak does not expose private verification material, create fake urgency, rank people, or allow payment and
            routing to bypass review.
          </p>
        </div>
      </div>

      <div className="companion-safety-grid">
        {loadState.data.safetyGuidance.map((item) => (
          <article key={item} className="companion-safety-card">
            <h2>{item}</h2>
            <p>
              This rule is reflected in companion registration, profile visibility, availability, and routed inquiry
              states.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
