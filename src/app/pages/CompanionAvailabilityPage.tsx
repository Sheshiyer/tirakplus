import { FormEvent, useEffect, useState } from "react";
import type { AvailabilityWindow, CitySlug, CompanionOnboardingState } from "../../shared/contracts";
import { CompanionApiError, CompanionService } from "../api/companion";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Textarea } from "../components/ui/Textarea";

type LoadState =
  | { status: "loading"; data?: undefined; message?: undefined }
  | { status: "ready"; data: CompanionOnboardingState; message?: undefined }
  | { status: "error"; data?: undefined; message: string };

const statusOptions = [
  { value: "available", label: "Available after review" },
  { value: "tentative", label: "Tentative planning" },
  { value: "hidden", label: "Hidden" },
];

export function CompanionAvailabilityPage() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    CompanionService.getOnboarding()
      .then((data) => {
        if (cancelled) return;
        setLoadState({ status: "ready", data });
        setWindows(data.profile.availabilityWindows);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : "Availability could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveAvailability = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await CompanionService.updateAvailability({ availabilityWindows: windows });
      setWindows(response.profile.availabilityWindows);
      setLoadState({ status: "ready", data: response.onboarding });
      setStatusMessage("Availability saved through the companion API rail.");
    } catch (error) {
      if (error instanceof CompanionApiError) {
        setFieldErrors(error.fieldErrors || {});
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Availability could not be saved.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateWindow = (id: string, nextWindow: AvailabilityWindow) => {
    setWindows((current) => current.map((item) => (item.id === id ? nextWindow : item)));
  };

  const addWindow = () => {
    const fallbackCity = loadState.status === "ready" ? loadState.data.profile.city : "bangkok";
    setWindows((current) => [
      ...current,
      {
        id: `av-draft-${current.length + 1}`,
        city: fallbackCity,
        label: "New review window",
        status: "tentative",
        note: "Describe planning context before making this visible.",
      },
    ]);
  };

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
          title="Availability unavailable"
          description={loadState.message}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </section>
    );
  }

  const { data } = loadState;

  return (
    <section className="companion-page companion-availability-page" aria-labelledby="companion-availability-title">
      <div className="companion-hero">
        <div>
          <p className="eyebrow">Availability</p>
          <h1 id="companion-availability-title">Set planning windows without creating public urgency.</h1>
          <p>
            Availability is always visibility-scoped. Hidden windows stay out of discovery, and even available windows
            require review before routing.
          </p>
        </div>
        <div className="companion-progress-panel">
          <p className="meta">Visibility state</p>
          <h2>{data.profile.visibilitySettings.showAvailability ? "Availability can show after approval" : "Availability hidden"}</h2>
          <p>{data.profile.reviewNote}</p>
        </div>
      </div>

      <form className="availability-form" onSubmit={saveAvailability}>
        <div className="availability-toolbar">
          <div>
            <p className="eyebrow">Calendar list</p>
            <h2>Reviewed windows</h2>
          </div>
          <Button type="button" variant="secondary" onClick={addWindow}>
            Add window
          </Button>
        </div>

        <div className="availability-editor-list">
          {windows.map((window, index) => (
            <article key={window.id} className={`availability-editor-card availability-editor-card-${window.status}`}>
              <div className="form-two-column">
                <Input
                  label="Window label"
                  value={window.label}
                  error={fieldErrors[`availabilityWindows.${index}.label`]}
                  onChange={(event) => updateWindow(window.id, { ...window, label: event.target.value })}
                />
                <Select
                  label="City"
                  value={window.city}
                  options={data.options.cities}
                  onChange={(event) => updateWindow(window.id, { ...window, city: event.target.value as CitySlug })}
                />
              </div>
              <Select
                label="Visibility status"
                value={window.status}
                options={statusOptions}
                onChange={(event) =>
                  updateWindow(window.id, {
                    ...window,
                    status: event.target.value as AvailabilityWindow["status"],
                  })
                }
              />
              <Textarea
                label="Planning note"
                value={window.note}
                error={fieldErrors[`availabilityWindows.${index}.note`]}
                helperText="Use review-safe timing and context. Avoid urgency, demand, or explicit copy."
                onChange={(event) => updateWindow(window.id, { ...window, note: event.target.value })}
              />
            </article>
          ))}
        </div>

        {fieldErrors.availabilityWindows && <p className="field-error">{fieldErrors.availabilityWindows}</p>}
        {statusMessage && <p className="companion-status-message">{statusMessage}</p>}

        <div className="availability-hidden-note">
          <h2>Hidden state</h2>
          <p>
            Hidden windows are retained for review and planning, but they do not appear in traveller discovery or profile
            availability panels.
          </p>
        </div>

        <div className="action-row">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save availability"}
          </Button>
        </div>
      </form>
    </section>
  );
}
