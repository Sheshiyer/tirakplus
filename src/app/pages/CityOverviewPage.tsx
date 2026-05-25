import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, CitySlug, CitySummary, ExperienceSummary } from "../../shared/contracts";
import { CityOverview } from "../components/home/CityOverview";
import { Button } from "../components/ui/Button";

type HomeData = {
  brand: { name: string; promise: string };
  cities: CitySummary[];
  highlights: string[];
};

type CityPageState =
  | { status: "loading" }
  | { status: "ready"; city: CitySummary; experiences: ExperienceSummary[] }
  | { status: "error"; message: string };

interface CityOverviewPageProps {
  citySlug: CitySlug;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function CityOverviewPage({ citySlug }: CityOverviewPageProps) {
  const [state, setState] = useState<CityPageState>({ status: "loading" });

  useEffect(() => {
    Promise.all([
      getJson<HomeData>("/api/public/home"),
      getJson<ExperienceSummary[]>(`/api/public/experiences?city=${citySlug}`),
    ])
      .then(([home, experiences]) => {
        const city = home.cities.find((item) => item.slug === citySlug);
        if (!city) {
          setState({ status: "error", message: "City overview is unavailable." });
          return;
        }

        setState({ status: "ready", city, experiences });
      })
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load this city overview.",
        });
      });
  }, [citySlug]);

  if (state.status === "loading") {
    return (
      <div className="city-page">
        <section className="home-loading" aria-label="Loading city overview">
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
      <div className="city-page">
        <section className="error-panel" role="alert">
          <p className="eyebrow">City unavailable</p>
          <h1>We could not load this city overview</h1>
          <p>{state.message}</p>
          <Button as={Link} to="/" variant="secondary">
            Return home
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="city-page">
      <section className="city-page-hero" aria-labelledby={`${state.city.slug}-page-title`}>
        <p className="eyebrow">City</p>
        <h1 id={`${state.city.slug}-page-title`}>{state.city.name} starts with local rhythm</h1>
        <p className="lede">
          Name timing, transport, and boundaries first. Muse keeps the read private while you choose what comes next.
        </p>
      </section>
      <CityOverview city={state.city} experiences={state.experiences} />
      {state.experiences.length === 0 ? (
        <section className="empty-panel">
          <p className="eyebrow">Experiences</p>
          <h2>No reviewed experience guides are ready for this city yet.</h2>
          <p>Try another city overview or return to traveller discovery.</p>
        </section>
      ) : null}
      <section className="city-page-cta" aria-labelledby={`${state.city.slug}-cta-title`}>
        <div>
          <p className="eyebrow">Next step</p>
          <h2 id={`${state.city.slug}-cta-title`}>Take this city into discovery.</h2>
        </div>
        <Button as={Link} to="/discovery" variant="primary">
          Open discovery
        </Button>
      </section>
    </div>
  );
}
