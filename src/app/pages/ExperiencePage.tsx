import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, ExperienceSlug, ExperienceSummary } from "../../shared/contracts";
import { Button } from "../components/ui/Button";

const experienceLabels: Record<ExperienceSlug, { title: string; eyebrow: string; description: string }> = {
  nightlife: {
    title: "Nightlife experience",
    eyebrow: "After-dark planning",
    description: "Lounge, rooftop, and late-evening plans with discretion, transport, and timing named early.",
  },
  "island-explorer": {
    title: "Island explorer experience",
    eyebrow: "Island pacing",
    description: "Beach clubs, coves, wellness stops, and quieter routes with privacy kept close.",
  },
  "muay-thai-night": {
    title: "Muay Thai night",
    eyebrow: "Fight-night context",
    description: "Respectful local fight-night planning with seating, timing, and transport kept clear.",
  },
  "private-dining": {
    title: "Private dining experience",
    eyebrow: "Dining route",
    description: "Composed restaurant and resort-area evenings with timing and privacy named upfront.",
  },
  "local-guidance": {
    title: "Local guidance experience",
    eyebrow: "Local fluency",
    description: "City and island guidance for boundaries, transport, safety, and calm introductions.",
  },
};

type ExperiencePageState =
  | { status: "loading" }
  | { status: "ready"; experiences: ExperienceSummary[] }
  | { status: "error"; message: string };

interface ExperiencePageProps {
  experienceSlug: ExperienceSlug;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function ExperiencePage({ experienceSlug }: ExperiencePageProps) {
  const [state, setState] = useState<ExperiencePageState>({ status: "loading" });
  const copy = experienceLabels[experienceSlug];

  useEffect(() => {
    getJson<ExperienceSummary[]>(`/api/public/experiences?category=${experienceSlug}`)
      .then((experiences) => setState({ status: "ready", experiences }))
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load this experience.",
        });
      });
  }, [experienceSlug]);

  if (state.status === "loading") {
    return (
      <div className="experience-page">
        <section className="home-loading" aria-label="Loading experience page">
          <div className="loading-line loading-line-short" />
          <div className="loading-line loading-line-title" />
          <div className="loading-line" />
          <div className="loading-panel" />
        </section>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="experience-page">
        <section className="error-panel" role="alert">
          <p className="eyebrow">Experience unavailable</p>
          <h1>We could not load this experience.</h1>
          <p>{state.message}</p>
          <Button as={Link} to="/" variant="secondary">
            Return home
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="experience-page">
      <section className="experience-hero" aria-labelledby={`${experienceSlug}-title`}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id={`${experienceSlug}-title`}>{copy.title}</h1>
        <p className="lede">{copy.description}</p>
        <div className="action-row">
          <Button as={Link} to="/discovery" variant="primary">
            Open discovery
          </Button>
          <Button as={Link} to="/safety" variant="secondary">
            Review safety guidance
          </Button>
        </div>
      </section>

      <section className="experience-context-section" aria-label={`${copy.title} city contexts`}>
        {state.experiences.length === 0 ? (
          <div className="empty-panel">
            <p className="eyebrow">Experience contexts</p>
            <h2>This experience is still being prepared.</h2>
            <p>Return to city overviews while this guide is finished.</p>
          </div>
        ) : (
          <div className="experience-list experience-list-wide">
            {state.experiences.map((experience) => (
              <article className="experience-card" key={`${experience.city}-${experience.slug}`}>
                <p className="meta">{experience.city.replaceAll("-", " ")}</p>
                <h3>{experience.title}</h3>
                <p>{experience.summary}</p>
                <p className="experience-safety-note">{experience.safetyNote}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
