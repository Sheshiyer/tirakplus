import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { MusePoseImage } from "../components/muse/MusePoseImage";

const discoverySteps = [
  {
    label: "Read the moment",
    title: "Muse starts with city, pace, and boundary.",
    description:
      "The first screen is a private conversation. It shapes the route before any protected profile or inquiry surface appears.",
  },
  {
    label: "Shape the route",
    title: "Discovery opens only after context is clear.",
    description:
      "Cities, experience style, timing, and visibility preferences guide what the signed-in view can responsibly show.",
  },
  {
    label: "Keep review close",
    title: "Inquiry steps stay behind safety and support checks.",
    description:
      "Tirak Plus avoids public browse pressure. Review, privacy, and payment supportability remain part of the path.",
  },
];

export function PublicDiscoveryPage() {
  return (
    <div className="public-business-page public-discovery-page">
      <section className="public-business-hero public-business-hero-dark" aria-labelledby="public-discovery-title">
        <div>
          <p className="eyebrow">Private discovery</p>
          <h1 id="public-discovery-title">Start with Muse before profiles appear.</h1>
          <p className="lede">
            Tirak Plus begins with a private read of the trip: where you are, what the evening should feel like,
            and what should stay off-limits. The signed-in product opens after that context is understood.
          </p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Start with Muse</Button>
            <Button as={Link} to="/auth/login?role=traveller" variant="secondary">Continue as traveller</Button>
          </div>
        </div>
        <aside className="public-muse-aside" aria-label="Muse discovery guidance">
          <MusePoseImage variant="chat" label="Muse listening to discovery context" className="public-muse-figure" />
          <div className="public-muse-note">
            <span>Context first</span>
            <p>No public profile grid appears before boundaries, city, and fit are shaped.</p>
          </div>
        </aside>
      </section>

      <section className="public-section" aria-labelledby="discovery-flow-title">
        <div className="public-section-heading">
          <p className="eyebrow">How it opens</p>
          <h2 id="discovery-flow-title">A slower route by design.</h2>
          <p>
            The public site explains the shape of the product. The protected discovery workspace appears only after
            sign-in because identity, safety, and visibility rules matter here.
          </p>
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
          <p className="eyebrow">Public boundary</p>
          <h2 id="discovery-boundary-title">Why discovery is not an open catalogue.</h2>
        </div>
        <div className="public-check-list">
          <p>Companion visibility is controlled and reviewed.</p>
          <p>Traveller intent is framed before inquiry routing.</p>
          <p>Payment movement stays disabled until review and supportability gates are cleared.</p>
        </div>
      </section>
    </div>
  );
}
