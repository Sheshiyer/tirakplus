import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { MusePoseImage } from "../components/muse/MusePoseImage";

const discoverySteps = [
  {
    label: "City",
    title: "Bangkok, Phuket, Samui, or Phangan",
    description: "Start with where the evening is happening.",
  },
  {
    label: "Mood",
    title: "Quiet, warm, social, or late",
    description: "Set the tone before profiles appear.",
  },
  {
    label: "Boundary",
    title: "What stays off-limits",
    description: "Keep the first read private and specific.",
  },
];

export function PublicDiscoveryPage() {
  return (
    <div className="public-business-page public-discovery-page">
      <section className="public-business-hero public-business-hero-dark" aria-labelledby="public-discovery-title">
        <div>
          <p className="eyebrow">Discovery</p>
          <h1 id="public-discovery-title">Where are you tonight?</h1>
          <p className="lede">
            Tell Muse the city, mood, timing, and boundaries.
          </p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Start with Muse</Button>
            <Button as={Link} to="/auth/login?role=traveller" variant="secondary">Continue as traveller</Button>
          </div>
        </div>
        <aside className="public-muse-aside" aria-label="Muse discovery guidance">
          <MusePoseImage variant="chat" label="Muse listening to discovery context" className="public-muse-figure" />
          <div className="public-muse-note">
            <span>Muse is ready</span>
            <p>City, mood, time, boundaries.</p>
          </div>
        </aside>
      </section>

      <section className="public-section" aria-labelledby="discovery-flow-title">
        <div className="public-section-heading">
          <p className="eyebrow">Start points</p>
          <h2 id="discovery-flow-title">Give Muse the basics.</h2>
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
          <h2 id="discovery-boundary-title">Open your traveller workspace.</h2>
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
