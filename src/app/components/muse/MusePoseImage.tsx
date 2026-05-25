import { AssetRegistry } from "../../registry/assets";

export type MusePoseVariant = "splash" | "chat" | "privacy" | "companion" | "thinking";

interface MusePoseImageProps {
  variant: MusePoseVariant;
  label: string;
  className?: string;
}

export function MusePoseImage({ variant, label, className }: MusePoseImageProps) {
  const { mobilePortrait, tabletPortrait, desktopPortrait } = AssetRegistry.muse.scene;
  const motionClass = variant === "thinking" ? "muse-pose-thinking" : variant === "chat" ? "muse-pose-listening" : "";

  return (
    <figure className={`muse-pose ${motionClass} ${className || ""}`} aria-label={label}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktopPortrait} />
        <source media="(min-width: 640px)" srcSet={tabletPortrait} />
        <img
          src={mobilePortrait}
          alt=""
          loading={variant === "splash" ? "eager" : "lazy"}
          decoding={variant === "splash" ? "sync" : "async"}
          fetchPriority={variant === "splash" ? "high" : "auto"}
        />
      </picture>
    </figure>
  );
}
