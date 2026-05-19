import type { CompanionPreview } from "../../../shared/contracts";
import { AssetRegistry } from "../../registry/assets";
import { Card, CardContent } from "./Card";

export interface CompanionPreviewCardProps {
  profile: CompanionPreview;
}

export function CompanionPreviewCard({ profile }: CompanionPreviewCardProps) {
  const formattedState = profile.verificationState.replace(/_/g, " ");
  const stateClass =
    profile.verificationState === "approved"
      ? "approved"
      : profile.verificationState === "pending_verification"
        ? "pending"
        : "changes";

  return (
    <Card className="companion-preview-card">
      <CardContent className="companion-preview-content">
        <div className="companion-preview-media" aria-hidden="true">
          <img
            src={AssetRegistry.resolveAsset("profile", profile.avatarUrl)}
            alt=""
            loading="lazy"
          />
        </div>
        <div>
          <div className="companion-preview-header">
            <p className={`companion-verification companion-verification-${stateClass}`}>
              {formattedState}
            </p>
            <p className="companion-city-badge">
              {profile.city.replace("-", " ")}
            </p>
          </div>

          <h3>
            {profile.displayName}
          </h3>

          <p className="companion-tone">
            {profile.profileTone}
          </p>
        </div>

        <div>
          {profile.experienceTags.length > 0 && (
            <div className="companion-tag-row">
              {profile.experienceTags.map((tag) => (
                <span
                  key={tag}
                  className="companion-tag"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          )}

          <p className="companion-availability">
            {profile.availabilitySummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
