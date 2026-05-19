import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CitySlug, CompanionDraftProfile, CompanionOnboardingState, ExperienceSlug } from "../../shared/contracts";
import { useAuth } from "../api/AuthContext";
import { CompanionApiError, CompanionService } from "../api/companion";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionOnboardingState; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

export function CompanionProfileManagerPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [draft, setDraft] = useState<CompanionDraftProfile | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { session, switchRole, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    CompanionService.getOnboarding()
      .then((data) => {
        if (cancelled) return;
        setLoadState({ status: "ready", data });
        setDraft(data.profile);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : "Profile manager could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await CompanionService.updateProfile({
        displayName: draft.displayName,
        legalName: draft.legalName,
        city: draft.city,
        experienceTags: draft.experienceTags,
        bio: draft.bio,
        profileTone: draft.profileTone,
        privateReviewNote: draft.privateReviewNote,
        verificationReferences: draft.verificationReferences,
      });
      setDraft(response.profile);
      setLoadState({ status: "ready", data: response.onboarding });
      setStatusMessage("Profile draft saved and safe preview refreshed.");
    } catch (error) {
      if (error instanceof CompanionApiError) {
        setFieldErrors(error.fieldErrors || {});
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Profile draft could not be saved.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveVisibility = async () => {
    if (!draft) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await CompanionService.updateVisibility(draft.visibilitySettings);
      setDraft(response.profile);
      setLoadState({ status: "ready", data: response.onboarding });
      setStatusMessage("Visibility controls saved.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Visibility could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const switchToTraveller = async () => {
    await switchRole("traveller");
    navigate("/traveller");
  };

  const signOut = async () => {
    await logout();
    navigate("/");
  };

  if (loadState.status === "loading" || !draft) {
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
          title="Profile manager unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  const { data } = loadState;

  return (
    <section className="companion-page companion-profile-page" aria-labelledby="companion-profile-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Profile management</p>
          <h1 id="companion-profile-title">Edit the draft while previewing only safe public fields.</h1>
          <p>
            Public copy, private review notes, and account controls stay separated so approval can be audited later.
          </p>
        </div>
        <div className="companion-progress-panel">
          <MuseChartPanel chart={data.chart} compact />
          <p className="meta">Review state</p>
          <h2>{draft.reviewStatus.replace(/_/g, " ")}</h2>
          <p>{draft.reviewNote}</p>
        </div>
      </div>

      <div className="companion-editor-grid">
        <form className="companion-form" onSubmit={saveDraft}>
          <section className="companion-form-section">
            <p className="eyebrow">Draft editor</p>
            <div className="form-two-column">
              <Input
                label="Display name"
                value={draft.displayName}
                error={fieldErrors.displayName}
                onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
              />
              <Select
                label="City"
                value={draft.city}
                options={data.options.cities}
                error={fieldErrors.city}
                onChange={(event) => setDraft({ ...draft, city: event.target.value as CitySlug })}
              />
            </div>
            <Textarea
              label="Public bio"
              value={draft.bio}
              error={fieldErrors.bio}
              helperText="Use composed hospitality and itinerary language, not ranking or attraction language."
              onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
            />
            <Textarea
              label="Private review note"
              value={draft.privateReviewNote}
              error={fieldErrors.privateReviewNote}
              helperText="Visible to review only."
              onChange={(event) => setDraft({ ...draft, privateReviewNote: event.target.value })}
            />
            <div className="choice-grid">
              {data.options.experiences.map((experience) => (
                <Checkbox
                  key={experience.value}
                  label={experience.label}
                  checked={draft.experienceTags.includes(experience.value)}
                  onChange={(event) => {
                    const experienceTags = event.target.checked
                      ? [...draft.experienceTags, experience.value]
                      : draft.experienceTags.filter((tag) => tag !== experience.value);
                    setDraft({ ...draft, experienceTags: experienceTags as ExperienceSlug[] });
                  }}
                />
              ))}
            </div>
            {fieldErrors.experienceTags && <p className="field-error">{fieldErrors.experienceTags}</p>}
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">Visibility control</p>
            <div className="choice-grid">
              <Checkbox
                label="Public profile after approval"
                checked={draft.visibilitySettings.publicProfile}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    visibilitySettings: { ...draft.visibilitySettings, publicProfile: event.target.checked },
                  })
                }
              />
              <Checkbox
                label="Show city"
                checked={draft.visibilitySettings.showCity}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    visibilitySettings: { ...draft.visibilitySettings, showCity: event.target.checked },
                  })
                }
              />
              <Checkbox
                label="Show availability"
                checked={draft.visibilitySettings.showAvailability}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    visibilitySettings: { ...draft.visibilitySettings, showAvailability: event.target.checked },
                  })
                }
              />
              <Checkbox
                label="Accept reviewed inquiries"
                checked={draft.visibilitySettings.acceptInquiries}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    visibilitySettings: { ...draft.visibilitySettings, acceptInquiries: event.target.checked },
                  })
                }
              />
            </div>
            <Button type="button" variant="secondary" onClick={saveVisibility} disabled={isSaving}>
              Save visibility
            </Button>
          </section>

          {statusMessage && <p className="companion-status-message">{statusMessage}</p>}

          <div className="action-row">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
            <Button as={Link} to="/companion/onboarding" variant="secondary">
              Onboarding
            </Button>
          </div>
        </form>

        <aside className="safe-preview-panel" aria-labelledby="safe-preview-title">
          <p className="eyebrow">Safe preview</p>
          <h2 id="safe-preview-title">{draft.visibilitySettings.publicProfile ? draft.displayName : "Profile hidden"}</h2>
          <p>{draft.visibilitySettings.publicProfile ? draft.bio : "Public preview is paused until review and visibility approval."}</p>
          <div className="preview-meta-grid">
            <span>{draft.visibilitySettings.showCity ? draft.city.replace(/-/g, " ") : "City hidden"}</span>
            <span>{draft.visibilitySettings.showAvailability ? "Availability visible after approval" : "Availability hidden"}</span>
            <span>{draft.visibilitySettings.acceptInquiries ? "Reviewed inquiries allowed after approval" : "Inquiries paused"}</span>
          </div>
          <div className="account-mini-panel">
            <h3>Account</h3>
            <p>{session?.profile.email}</p>
            <div className="action-row">
              <Button type="button" variant="secondary" onClick={switchToTraveller} disabled={isLoading}>
                Switch to traveller
              </Button>
              <Button type="button" variant="danger" onClick={signOut} disabled={isLoading}>
                Sign out
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
