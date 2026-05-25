import { useEffect, useState } from "react";
import type { CompanionDashboardResponse } from "../../shared/contracts";
import { CompanionService } from "../api/companion";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionDashboardResponse; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

const companionSafetyDetails = [
  {
    title: "Public profile fields stay separate from private notes.",
    description: "Edit what travellers can read without exposing documents, legal details, or internal notes.",
  },
  {
    title: "Availability is a signal, not pressure.",
    description: "Use windows to show calm timing. Hide anything that is uncertain or too broad.",
  },
  {
    title: "You can pause city, timing, and inquiries separately.",
    description: "Keep a profile visible while holding back details that need more care.",
  },
  {
    title: "Payment and contact details wait for review.",
    description: "Keep the conversation inside Tirak until the plan is clear and safe to continue.",
  },
];

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
          <h1 id="companion-safety-page-title">Visibility, review, and boundaries stay in your control.</h1>
          <p>
            Tirak keeps private documents hidden, avoids fake urgency, avoids ranking people, and keeps payment inside
            reviewed plans.
          </p>
        </div>
      </div>

      <div className="companion-safety-grid">
        {companionSafetyDetails.map((item) => (
          <article key={item.title} className="companion-safety-card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
