import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { MusePoseImage } from "../muse/MusePoseImage";

interface HomeHeroProps {
  brandName: string;
  brandPromise: string;
}

export function HomeHero({ brandName, brandPromise }: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-copy">
        <p className="eyebrow">
          Muse · Bangkok, Phuket, Koh Samui, Koh Phangan
        </p>
        <h1 id="home-hero-title">
          {brandName}
        </h1>
        <p className="lede">
          {brandPromise}
        </p>
        <form className="muse-chat-composer" aria-label="Muse trip prompt" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="muse-home-prompt">Start with Muse</label>
          <div className="muse-chat-input-row">
            <input
              id="muse-home-prompt"
              type="text"
              placeholder="Tell Muse the city, mood, and boundaries for the evening"
            />
            <Button as={Link} variant="primary" to="/">
              Start
            </Button>
          </div>
        </form>
        <div className="action-row">
          <Button as={Link} variant="primary" to="/discovery">
            See discovery path
          </Button>
          <Button as={Link} variant="secondary" to="/auth/login?role=companion">
            Companion path
          </Button>
        </div>
      </div>
      <aside className="hero-muse-panel" aria-label="Muse">
        <MusePoseImage variant="splash" label="Muse in a calm welcome pose" className="hero-muse-model" />
        <div className="hero-muse-copy">
          <p className="meta">Private workflow</p>
          <ol>
            <li>Muse starts with context, not a profile grid.</li>
            <li>Discovery stays guided by city, boundaries, and intent.</li>
            <li>Human review remains in the inquiry path.</li>
          </ol>
        </div>
      </aside>
    </section>
  );
}
