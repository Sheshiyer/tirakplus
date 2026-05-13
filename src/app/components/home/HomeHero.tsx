import { Button } from "../ui/Button";

interface HomeHeroProps {
  brandName: string;
  brandPromise: string;
}

export function HomeHero({ brandName, brandPromise }: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-copy">
        <p className="eyebrow">
          Bangkok, Phuket, Koh Samui, Koh Phangan
        </p>
        <h1 id="home-hero-title">
          {brandName}
        </h1>
        <p className="lede">
          {brandPromise}
        </p>
        <div className="action-row">
          <Button as="a" variant="primary" href="/traveller">
            Explore discreetly
          </Button>
          <Button as="a" variant="secondary" href="/companion">
            Companion path
          </Button>
        </div>
      </div>
      <aside className="hero-workflow-panel" aria-label="Tirak Plus workflow">
        <p className="meta">Private workflow</p>
        <ol>
          <li>Choose a city and experience context.</li>
          <li>Review verified visibility and availability notes.</li>
          <li>Send a discreet inquiry for human review.</li>
        </ol>
      </aside>
    </section>
  );
}
