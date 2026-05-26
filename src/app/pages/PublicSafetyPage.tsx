import { CSSProperties, PointerEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, SafetyContent } from "../../shared/contracts";
import { Button } from "../components/ui/Button";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { AssetRegistry } from "../registry/assets";

type SafetyState =
  | { status: "loading" }
  | { status: "ready"; content: SafetyContent }
  | { status: "error"; message: string };

async function getSafetyContent(): Promise<SafetyContent> {
  const response = await fetch("/api/safety/content", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<SafetyContent>;
  return envelope.data;
}

const safetyGroups = [
  {
    title: "For travellers",
    items: [
      "Share only what the plan needs.",
      "Keep messages practical, respectful, and easy to review later.",
      "Use report tools when a request feels rushed or unclear.",
    ],
  },
  {
    title: "For companions",
    items: [
      "Control when your profile is visible.",
      "Use availability as guidance, not pressure.",
      "Keep private notes separate from what travellers see.",
    ],
  },
  {
    title: "What stays close",
    items: [
      "Profiles are checked before introductions move forward.",
      "Reports stay close to messages and plans.",
      "Payment steps stay away until the plan is clear.",
    ],
  },
];

export function PublicSafetyPage() {
  const [state, setState] = useState<SafetyState>({ status: "loading" });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    getSafetyContent()
      .then((content) => setState({ status: "ready", content }))
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load safety guidance.",
        });
      });
  }, []);

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
    <div className="public-business-page public-safety-page public-business-page-immersive">
      <section
        className="public-immersive-hero"
        data-scene="safety"
        aria-labelledby="public-safety-title"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setParallax({ x: 0, y: 0 })}
        style={sceneStyle}
      >
        <img className="public-immersive-backdrop" src={AssetRegistry.muse.scene.safetyBackdrop} alt="" aria-hidden="true" />
        <div className="public-immersive-vignette" aria-hidden="true" />
        <div className="public-immersive-ambient" aria-hidden="true" />

        <div className="public-immersive-shell">
          <div className="public-immersive-copy">
            <p className="eyebrow">Safety and privacy</p>
            <h1 id="public-safety-title">Keep the plan calm and private</h1>
            <p className="lede">
              Share only what the plan needs, keep boundaries clear, and pause anything that feels rushed or wrong.
            </p>
            <div className="action-row">
              <Button as={Link} to="/" variant="primary">Talk to Muse</Button>
              <Button as={Link} to="/auth/login?role=traveller" variant="secondary">Sign in</Button>
            </div>
          </div>

          <MusePoseImage
            variant="privacy"
            label="Muse standing in a composed privacy posture"
            className="public-immersive-figure"
          />

          <aside className="public-immersive-readout" aria-label="Muse privacy readout">
            <p className="eyebrow">Quiet by design</p>
            <p>Boundaries held. Pace respected.</p>
          </aside>
        </div>
      </section>

      <section className="public-section" aria-labelledby="safety-principles-title">
        <div className="public-section-heading">
          <p className="eyebrow">Safety checks</p>
          <h2 id="safety-principles-title">{state.status === "ready" ? state.content.title : "Safety and discretion"}</h2>
          {state.status === "error" ? <p>{state.message}</p> : null}
        </div>
        <div className="public-card-grid public-card-grid-four">
          {(state.status === "ready"
            ? state.content.principles
            : ["Verification loading.", "Review loading.", "Privacy loading.", "Support loading."]
          ).map((principle) => (
            <article className="public-info-card public-info-card-quiet" key={principle}>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-section-tight" aria-labelledby="safety-groups-title">
        <div className="public-section-heading">
          <p className="eyebrow">What to expect</p>
          <h2 id="safety-groups-title">Clear controls for both sides</h2>
        </div>
        <div className="public-card-grid public-card-grid-three">
          {safetyGroups.map((group) => (
            <article className="public-info-card" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="public-bullet-list">
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
