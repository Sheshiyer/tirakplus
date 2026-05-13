import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CompanionProfile } from "../../shared/contracts";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonProfile } from "../components/ui/Skeleton";

type ProfileState =
  | { status: "loading"; profile?: undefined; message?: undefined; unavailable?: undefined }
  | { status: "ready"; profile: CompanionProfile; message?: undefined; unavailable?: undefined }
  | { status: "error"; profile?: undefined; message: string; unavailable: boolean };

export function CompanionProfilePage() {
  const { companionId } = useParams();
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  useEffect(() => {
    if (!companionId) {
      setState({ status: "error", message: "Profile route is missing an identifier.", unavailable: true });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getProfile(companionId)
      .then((profile) => {
        if (!cancelled) setState({ status: "ready", profile });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const unavailable = error instanceof ApiRequestError && (error.status === 404 || error.status === 423);
          setState({
            status: "error",
            unavailable,
            message: error instanceof Error ? error.message : "This profile is unavailable.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  if (state.status === "loading") {
    return (
      <section className="profile-page">
        <SkeletonProfile />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="profile-page">
        <FeedbackState
          variant={state.unavailable ? "empty" : "error"}
          title={state.unavailable ? "Profile is not available" : "Profile could not load"}
          description={state.message}
          actionLabel="Back to discovery"
          onAction={() => window.location.assign("/traveller/discovery")}
        />
      </section>
    );
  }

  const { profile } = state;

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-hero">
        <div>
          <p className="eyebrow">{profile.city.replace("-", " ")}</p>
          <h1 id="profile-title">{profile.displayName}</h1>
          <p className="lede">{profile.profileTone}</p>
          <p className="profile-bio">{profile.bio}</p>
          <div className="action-row">
            <Button as={Link} to={`/traveller/companions/${profile.id}/inquire`} variant="primary">
              Start private inquiry
            </Button>
            <Button as={Link} to="/traveller/discovery" variant="secondary">
              Back to discovery
            </Button>
          </div>
        </div>

        <aside className="profile-verification-panel" aria-label="Verification state">
          <p className="meta">Verification</p>
          <h2>{profile.verification.label}</h2>
          <p>{profile.verification.reviewNote}</p>
        </aside>
      </div>

      <div className="profile-detail-grid">
        <section className="profile-detail-panel" aria-labelledby="availability-heading">
          <h2 id="availability-heading">Availability context</h2>
          <div className="availability-list">
            {profile.availabilityWindows.map((window) => (
              <article key={window.id} className={`availability-item availability-item-${window.status}`}>
                <p className="meta">{window.status.replace("_", " ")}</p>
                <h3>{window.label}</h3>
                <p>{window.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-detail-panel" aria-labelledby="fit-heading">
          <h2 id="fit-heading">Experience fit</h2>
          <div className="experience-fit-list">
            {profile.experienceFit.map((fit) => (
              <article key={fit.slug} className="experience-fit-item">
                <h3>{fit.title}</h3>
                <p>{fit.fitNote}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="profile-safety-panel" aria-labelledby="profile-safety-heading">
        <div>
          <p className="eyebrow">Safety note</p>
          <h2 id="profile-safety-heading">{profile.safetyNote}</h2>
        </div>
        <ul>
          {profile.inquiryGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
