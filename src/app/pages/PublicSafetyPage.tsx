import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, SafetyContent } from "../../shared/contracts";
import { Button } from "../components/ui/Button";
import { MusePoseImage } from "../components/muse/MusePoseImage";

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
      "Start with context and boundaries before sending an inquiry.",
      "Keep messages practical, respectful, and tied to a real plan.",
      "Review safety guidance before any payment or introduction step appears.",
    ],
  },
  {
    title: "For companions",
    items: [
      "Profile visibility stays controlled and can remain hidden during review.",
      "Availability is planning context, not pressure to accept every inquiry.",
      "Public profile copy stays separate from private review information.",
    ],
  },
  {
    title: "For the platform",
    items: [
      "Verification and review sit before discovery, inquiry routing, and payment state.",
      "Reports and unsafe requests are treated as product rails, not afterthoughts.",
      "Provider supportability is required before money movement is enabled.",
    ],
  },
];

export function PublicSafetyPage() {
  const [state, setState] = useState<SafetyState>({ status: "loading" });

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

  return (
    <div className="public-business-page public-safety-page">
      <section className="public-business-hero" aria-labelledby="public-safety-title">
        <div>
          <p className="eyebrow">Safety and privacy</p>
          <h1 id="public-safety-title">Discretion is part of the product surface.</h1>
          <p className="lede">
            Tirak Plus is designed around adult agency, visibility control, reviewed introductions, and clear
            boundaries. Safety is not hidden behind a footer link.
          </p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Talk to Muse</Button>
            <Button as={Link} to="/payments" variant="secondary">Review payment gates</Button>
          </div>
        </div>
        <aside className="public-muse-aside public-muse-aside-light" aria-label="Muse privacy guidance">
          <MusePoseImage variant="privacy" label="Muse standing in a composed privacy posture" className="public-muse-figure" />
        </aside>
      </section>

      <section className="public-section" aria-labelledby="safety-principles-title">
        <div className="public-section-heading">
          <p className="eyebrow">Operating principles</p>
          <h2 id="safety-principles-title">{state.status === "ready" ? state.content.title : "Safety and discretion"}</h2>
          {state.status === "error" ? <p>{state.message}</p> : null}
        </div>
        <div className="public-card-grid public-card-grid-four">
          {(state.status === "ready"
            ? state.content.principles
            : ["Loading verification guidance.", "Loading review guidance.", "Loading privacy guidance.", "Loading payment guidance."]
          ).map((principle) => (
            <article className="public-info-card public-info-card-quiet" key={principle}>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-section-tight" aria-labelledby="safety-groups-title">
        <div className="public-section-heading">
          <p className="eyebrow">What this means</p>
          <h2 id="safety-groups-title">Different controls for different sides of the marketplace.</h2>
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
