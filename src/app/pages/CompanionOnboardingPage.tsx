import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {
  CitySlug,
  CompanionDraftProfile,
  CompanionOnboardingState,
  ExperienceSlug,
} from "../../shared/contracts";
import { CompanionApiError, CompanionService } from "../api/companion";
import { CompanionExperienceFields } from "../components/companion/CompanionExperienceFields";
import { CompanionVisibilityFields } from "../components/companion/CompanionVisibilityFields";
import { MuseChartPanel } from "../components/muse/MuseChartPanel";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Input } from "../components/ui/Input";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionOnboardingState; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

type SubmitState = {
  identityAcknowledged: boolean;
  visibilityAcknowledged: boolean;
  safetyAcknowledged: boolean;
};

export function CompanionOnboardingPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [draft, setDraft] = useState<CompanionDraftProfile | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    identityAcknowledged: false,
    visibilityAcknowledged: false,
    safetyAcknowledged: false,
  });

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
            message: error instanceof Error ? error.message : "Companion onboarding could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const applyProfile = (nextProfile: CompanionDraftProfile, onboarding?: CompanionOnboardingState) => {
    setDraft(nextProfile);
    if (onboarding) setLoadState({ status: "ready", data: onboarding });
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
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
      applyProfile(response.profile, response.onboarding);
      setStatusMessage("Profile draft saved.");
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
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await CompanionService.updateVisibility(draft.visibilitySettings);
      applyProfile(response.profile, response.onboarding);
      setStatusMessage("Visibility settings saved. Your profile remains private until review is complete.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Visibility settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitForVerification = async () => {
    if (!draft) return;
    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await CompanionService.submitVerification(submitState);
      applyProfile(response.profile);
      setStatusMessage(response.nextStep);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (error) {
      if (error instanceof CompanionApiError) {
        setFieldErrors(error.fieldErrors || {});
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Verification could not be submitted.");
      }
    } finally {
      setIsSaving(false);
    }
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
          title="Onboarding unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  const { data } = loadState;

  return (
    <section className="companion-page companion-onboarding-page" aria-labelledby="companion-onboarding-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Hosting profile</p>
          <h1 id="companion-onboarding-title">Build your profile at your pace.</h1>
          <p>
            Keep verification details private, shape your public bio, and submit when your visibility settings feel
            right.
          </p>
        </div>
        <div className="companion-progress-panel">
          <MusePoseImage variant="companion" label="Muse presenting companion onboarding guidance" className="companion-assist-muse" />
          <MuseChartPanel chart={data.chart} compact />
          <p className="meta">Progress</p>
          <h2>{data.progress.label}</h2>
          <p>{draft.reviewNote}</p>
        </div>
      </div>

      <div className="companion-workflow-grid">
        <aside className="companion-step-panel" aria-label="Onboarding steps">
          {data.steps.map((step) => (
            <article key={step.id} className={`companion-step companion-step-${step.status}`}>
              <p className="meta">{step.status}</p>
              <h3>{step.label}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </aside>

        <form className="companion-form" onSubmit={saveProfile}>
          <section className="companion-form-section">
            <p className="eyebrow">Welcome</p>
            <h2>You control what becomes public</h2>
            <p>
              Draft information stays private until Tirak finishes reviewing your profile. Visibility, availability, and inquiry
              controls remain closed while your profile is prepared.
            </p>
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">Basics</p>
            <div className="form-two-column">
              <Input
                label="Public display name"
                value={draft.displayName}
                error={fieldErrors.displayName}
                helperText="Shown only after review approves public visibility."
                onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
              />
              <Input
                label="Private legal name"
                value={draft.legalName}
                error={fieldErrors.legalName}
                helperText="Shown only to review."
                onChange={(event) => setDraft({ ...draft, legalName: event.target.value })}
              />
            </div>
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">Profile tone</p>
            <Textarea
              label="Public bio"
              value={draft.bio}
              error={fieldErrors.bio}
              helperText="Keep it practical, polished, and non-objectifying."
              onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
            />
            <Textarea
              label="Profile tone"
              value={draft.profileTone}
              error={fieldErrors.profileTone}
              helperText="Describe the style of planning and hospitality fit."
              onChange={(event) => setDraft({ ...draft, profileTone: event.target.value })}
            />
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">City and experiences</p>
            <Select
              label="Primary city"
              value={draft.city}
              options={data.options.cities}
              error={fieldErrors.city}
              onChange={(event) => setDraft({ ...draft, city: event.target.value as CitySlug })}
            />
            <CompanionExperienceFields
              draft={draft}
              options={data.options.experiences}
              onChange={setDraft}
              showDescriptions
              error={fieldErrors.experienceTags}
            />
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">Visibility controls</p>
            <CompanionVisibilityFields draft={draft} onChange={setDraft} mode="onboarding" />
            <Button type="button" variant="secondary" onClick={saveVisibility} disabled={isSaving}>
              Save visibility
            </Button>
          </section>

          <section className="companion-form-section">
            <p className="eyebrow">Verification</p>
            <Textarea
              label="Private review note"
              value={draft.privateReviewNote}
              error={fieldErrors.privateReviewNote}
              helperText="Include safety, logistics, visibility, or boundary context for review."
              onChange={(event) => setDraft({ ...draft, privateReviewNote: event.target.value })}
            />
            <Textarea
              label="Verification references"
              value={draft.verificationReferences.join("\n")}
              error={fieldErrors.verificationReferences}
              helperText="One reference per line. Keep sensitive material out of the bio."
              onChange={(event) =>
                setDraft({
                  ...draft,
                  verificationReferences: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                })
              }
            />
            <div className="choice-grid">
              <Checkbox
                label="I understand identity details are private review material."
                checked={submitState.identityAcknowledged}
                error={fieldErrors.identityAcknowledged}
                onChange={(event) => setSubmitState({ ...submitState, identityAcknowledged: event.target.checked })}
              />
              <Checkbox
                label="I understand the profile stays hidden until review approval."
                checked={submitState.visibilityAcknowledged}
                error={fieldErrors.visibilityAcknowledged}
                onChange={(event) => setSubmitState({ ...submitState, visibilityAcknowledged: event.target.checked })}
              />
              <Checkbox
                label="I understand Tirak blocks unsafe, explicit, or pressure-based requests."
                checked={submitState.safetyAcknowledged}
                error={fieldErrors.safetyAcknowledged}
                onChange={(event) => setSubmitState({ ...submitState, safetyAcknowledged: event.target.checked })}
              />
            </div>
          </section>

          {statusMessage && <p className="companion-status-message">{statusMessage}</p>}

          <div className="action-row">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <Button type="button" variant="secondary" onClick={submitForVerification} disabled={isSaving}>
              Submit for review
            </Button>
            <Button as={Link} to="/companion/dashboard" variant="secondary">
              Dashboard
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
