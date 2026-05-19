import { AssetRegistry } from "../../registry/assets";

export type MusePoseVariant = "splash" | "chat" | "privacy" | "companion" | "thinking";

interface MusePoseImageProps {
  variant: MusePoseVariant;
  label: string;
  className?: string;
}

export function MusePoseImage({ variant, label, className }: MusePoseImageProps) {
  const src = AssetRegistry.muse.poses[variant];
  const motionClass = variant === "thinking" ? "muse-pose-thinking" : variant === "chat" ? "muse-pose-listening" : "";

  return (
    <figure className={`muse-pose ${motionClass} ${className || ""}`} aria-label={label}>
      <img src={src} alt="" loading={variant === "splash" ? "eager" : "lazy"} decoding={variant === "splash" ? "sync" : "async"} fetchPriority={variant === "splash" ? "high" : "auto"} />
    </figure>
  );
}
