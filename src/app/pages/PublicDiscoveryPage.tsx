import { CSSProperties, PointerEvent, useState } from "react";
import { Link } from "react-router-dom";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { Button } from "../components/ui/Button";
import { AssetRegistry } from "../registry/assets";

const discoverySteps = [
  {
    label: "City",
    title: "Bangkok, Phuket, Samui, or Phangan",
    description: "Start with where the evening is happening.",
  },
  {
    label: "Mood",
    title: "Quiet, warm, social, or late",
    description: "Set the tone before you continue.",
  },
  {
    label: "Boundary",
    title: "What stays off-limits",
    description: "Keep the first read private and specific.",
  },
];

export function PublicDiscoveryPage() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setParallax({ x, y });
  }

  const sceneStyle = {
    "--muse-parallax-x": `${parallax.x}px`,
    "--muse-parallax-y": `${parallax.y}px`,
  } as CSSProperties;

  return (
    <div className="public-business-page public-discovery-page public-business-page-immersive">
      <section
        className="public-immersive-hero"
        data-scene="discovery"
        aria-labelledby="public-discovery-title"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setParallax({ x: 0, y: 0 })}
        style={sceneStyle}
      >
        <img className="public-immersive-backdrop" src={AssetRegistry.muse.scene.discoveryBackdrop} alt="" aria-hidden="true" />
        <div className="public-immersive-vignette" aria-hidden="true" />
        <div className="public-immersive-ambient" aria-hidden="true" />

        <div className="public-immersive-shell">
          <div className="public-immersive-copy">
            <p className="eyebrow">Discovery</p>
            <h1 id="public-discovery-title">Where are you tonight?</h1>
            <p className="lede">Tell Muse the city, mood, timing, and boundaries.</p>
            <div className="action-row">
              <Button as={Link} to="/" variant="primary">Start with Muse</Button>
              <Button as={Link} to="/auth/login?role=traveller" variant="secondary">Sign in</Button>
            </div>
          </div>

          <MusePoseImage
            variant="chat"
            label="Muse listening to discovery context"
            className="public-immersive-figure"
          />

          <aside className="public-immersive-readout" aria-label="Muse discovery readout">
            <p className="eyebrow">Muse is ready</p>
            <p>City, mood, time, boundaries.</p>
          </aside>
        </div>
      </section>

      <section className="public-section" aria-labelledby="discovery-flow-title">
        <div className="public-section-heading">
          <p className="eyebrow">Start points</p>
          <h2 id="discovery-flow-title">Start with a private read</h2>
        </div>
        <div className="public-card-grid public-card-grid-three">
          {discoverySteps.map((step) => (
            <article className="public-info-card" key={step.label}>
              <p className="meta">{step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-split-band" aria-labelledby="discovery-boundary-title">
        <div>
          <p className="eyebrow">Continue</p>
          <h2 id="discovery-boundary-title">Keep your plans together</h2>
        </div>
        <div className="public-check-list">
          <p>Saved context</p>
          <p>Reviewed profiles</p>
          <p>Plans and messages</p>
        </div>
      </section>
    </div>
  );
}
