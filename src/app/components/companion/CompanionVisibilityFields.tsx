import type {
  CompanionDraftProfile,
  CompanionVisibilitySettings,
} from "../../../shared/contracts";
import { Checkbox } from "../ui/Checkbox";

type CompanionVisibilityFieldsProps = {
  draft: CompanionDraftProfile;
  /** Update callback — caller passes back the patched draft. */
  onChange: (next: CompanionDraftProfile) => void;
  /** "approval" wording for onboarding context; "live" for the
   *  active-editor context where labels can be shorter. */
  mode?: "onboarding" | "manage";
};

/**
 * The four visibility checkboxes are identical across
 * CompanionOnboardingPage + CompanionProfileManagerPage. Extracted
 * here so the next contract change (e.g. add showHourlyRate) lands
 * in one place instead of two.
 *
 * `mode="onboarding"` includes the post-approval qualifier in each
 * label ("Show city AFTER REVIEW APPROVAL"); `mode="manage"` uses
 * the tighter active-editor labels.
 */
export function CompanionVisibilityFields({
  draft,
  onChange,
  mode = "manage",
}: CompanionVisibilityFieldsProps) {
  const set = (patch: Partial<CompanionVisibilitySettings>) =>
    onChange({
      ...draft,
      visibilitySettings: { ...draft.visibilitySettings, ...patch },
    });

  const suffix = mode === "onboarding" ? " after review approval" : "";

  return (
    <div className="choice-grid">
      <Checkbox
        label={`Allow public profile${mode === "onboarding" ? " after review approval" : ""}`}
        checked={draft.visibilitySettings.publicProfile}
        onChange={(event) => set({ publicProfile: event.target.checked })}
      />
      <Checkbox
        label={`Show city${suffix}`}
        checked={draft.visibilitySettings.showCity}
        onChange={(event) => set({ showCity: event.target.checked })}
      />
      <Checkbox
        label={`Show availability${suffix}`}
        checked={draft.visibilitySettings.showAvailability}
        onChange={(event) => set({ showAvailability: event.target.checked })}
      />
      <Checkbox
        label={mode === "onboarding" ? "Accept reviewed inquiries after approval" : "Accept reviewed inquiries"}
        checked={draft.visibilitySettings.acceptInquiries}
        onChange={(event) => set({ acceptInquiries: event.target.checked })}
      />
    </div>
  );
}
