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
          <h1 id="public-safety-title">Keep the plan calm and private.</h1>
          <p className="lede">
            Share only what the plan needs, keep boundaries clear, and pause anything that feels rushed or wrong.
          </p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Talk to Muse</Button>
            <Button as={Link} to="/payments" variant="secondary">Open payments guide</Button>
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
          <p className="eyebrow">What to expect</p>
          <h2 id="safety-groups-title">Clear controls for both sides.</h2>
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
