import type {
  CompanionDraftProfile,
  ExperienceSlug,
} from "../../../shared/contracts";
import { Checkbox } from "../ui/Checkbox";

type ExperienceOption = {
  value: string;
  label: string;
  description?: string;
};

type CompanionExperienceFieldsProps = {
  draft: CompanionDraftProfile;
  options: ExperienceOption[];
  onChange: (next: CompanionDraftProfile) => void;
  /** When true (onboarding context), show the per-option description
   *  as helper text so first-time hosts understand each style. */
  showDescriptions?: boolean;
  error?: string;
};

/**
 * Experience-tag picker (nightlife / island-explorer / muay-thai /
 * private-dining / local-guidance / …). Same logic appears in both
 * CompanionOnboardingPage + CompanionProfileManagerPage — extracted
 * here so adding/removing experience types lands once.
 */
export function CompanionExperienceFields({
  draft,
  options,
  onChange,
  showDescriptions = false,
  error,
}: CompanionExperienceFieldsProps) {
  return (
    <>
      <div className="choice-grid" role="group" aria-label="Experience styles">
        {options.map((experience) => (
          <Checkbox
            key={experience.value}
            label={experience.label}
            helperText={showDescriptions ? experience.description : undefined}
            checked={draft.experienceTags.includes(experience.value as ExperienceSlug)}
            onChange={(event) => {
              const next = event.target.checked
                ? [...draft.experienceTags, experience.value]
                : draft.experienceTags.filter((tag) => tag !== experience.value);
              onChange({ ...draft, experienceTags: next as ExperienceSlug[] });
            }}
          />
        ))}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </>
  );
}
