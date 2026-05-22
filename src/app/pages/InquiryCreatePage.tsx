import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CompanionProfile, ExperienceSlug, TravellerInquiryDetail } from "../../shared/contracts";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

type FormState = {
  experience: ExperienceSlug | "";
  preferredWindow: string;
  message: string;
  privacyAcknowledged: boolean;
};

type LoadState =
  | { status: "loading"; profile?: undefined; message?: undefined }
  | { status: "ready"; profile: CompanionProfile; message?: undefined }
  | { status: "error"; profile?: undefined; message: string };

export function InquiryCreatePage() {
  const { companionId } = useParams();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [form, setForm] = useState<FormState>({
    experience: "",
    preferredWindow: "",
    message: "",
    privacyAcknowledged: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdInquiry, setCreatedInquiry] = useState<TravellerInquiryDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!companionId) {
      setLoadState({ status: "error", message: "Inquiry route is missing a profile identifier." });
      return;
    }

    let cancelled = false;
    setLoadState({ status: "loading" });

    TravellerService.getProfile(companionId)
      .then((profile) => {
        if (cancelled) return;
        setLoadState({ status: "ready", profile });
        setForm((current) => ({
          ...current,
          experience: current.experience || profile.experienceFit[0]?.slug || "",
          preferredWindow: current.preferredWindow || profile.availabilityWindows[0]?.label || "",
        }));
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiry profile could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [companionId]);

  useEffect(() => {
    if (createdInquiry) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [createdInquiry]);

  const experienceOptions = useMemo(() => {
    if (loadState.status !== "ready") return [];
    return loadState.profile.experienceFit.map((fit) => ({
      value: fit.slug,
      label: fit.title,
    }));
  }, [loadState]);

  const windowOptions = useMemo(() => {
    if (loadState.status !== "ready") return [];
    return loadState.profile.availabilityWindows
      .filter((item) => item.status !== "hidden")
      .map((item) => ({
        value: item.label,
        label: item.label,
      }));
  }, [loadState]);

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loadState.status !== "ready" || !form.experience) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});
    setCreatedInquiry(null);

    try {
      const result = await TravellerService.createInquiry({
        companionId: loadState.profile.id,
        city: loadState.profile.city,
        experience: form.experience,
        preferredWindow: form.preferredWindow,
        message: form.message,
        privacyAcknowledged: form.privacyAcknowledged,
      });
      setCreatedInquiry(result.inquiry);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setSubmitError(error.message);
        setFieldErrors(error.fieldErrors || {});
      } else {
        setSubmitError("Inquiry could not be submitted.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadState.status === "loading") {
    return (
      <section className="inquiry-page">
        <SkeletonCard />
      </section>
    );
  }

  if (loadState.status === "error") {
    return (
      <section className="inquiry-page">
        <FeedbackState
          variant="error"
          title="Inquiry is unavailable"
          description={loadState.message}
          actionLabel="Back to discovery"
          onAction={() => window.location.assign("/traveller/discovery")}
        />
      </section>
    );
  }

  if (createdInquiry) {
    return (
      <section className="inquiry-page">
        <div className="inquiry-success-panel">
          <p className="eyebrow">Inquiry submitted</p>
          <h1>Private review has started.</h1>
          <p>{createdInquiry.nextStep}</p>
          <div className="inquiry-timeline">
            {createdInquiry.timeline.map((item) => (
              <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
                <p className="meta">{item.status}</p>
                <h3>{item.label}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
          <p className="privacy-note">{createdInquiry.privacyNote}</p>
          <div className="action-row">
            <Button as={Link} to="/traveller/inbox" variant="primary">
              View traveller inbox
            </Button>
            <Button as={Link} to="/traveller/discovery" variant="secondary">
              Return to discovery
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const { profile } = loadState;

  return (
    <section className="inquiry-page" aria-labelledby="inquiry-title">
      <div className="inquiry-heading">
        <p className="eyebrow">Private inquiry</p>
        <h1 id="inquiry-title">Send a reviewed inquiry to {profile.displayName}.</h1>
        <p>
          Inquiry details stay private and are reviewed before introduction or payment.
        </p>
      </div>

      <form className="inquiry-form" onSubmit={submitInquiry}>
        <Select
          label="Experience context"
          value={form.experience}
          options={experienceOptions}
          error={fieldErrors.experience}
          onChange={(event) => setForm((current) => ({ ...current, experience: event.target.value as ExperienceSlug }))}
        />
        <Select
          label="Preferred window"
          value={form.preferredWindow}
          options={windowOptions}
          error={fieldErrors.preferredWindow}
          onChange={(event) => setForm((current) => ({ ...current, preferredWindow: event.target.value }))}
        />
        <Textarea
          label="Inquiry message"
          value={form.message}
          error={fieldErrors.message}
          helperText="Share practical context: city, timing, route, boundaries, and expectations."
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        />
        <Checkbox
          label="I understand this inquiry requires private review before introduction or payment."
          checked={form.privacyAcknowledged}
          error={fieldErrors.privacyAcknowledged}
          onChange={(event) => setForm((current) => ({ ...current, privacyAcknowledged: event.target.checked }))}
        />

        {submitError && <p className="auth-error">{submitError}</p>}

        <div className="action-row">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </Button>
          <Button as={Link} to={`/traveller/companions/${profile.id}`} variant="secondary">
            Back to profile
          </Button>
        </div>
      </form>
    </section>
  );
}
