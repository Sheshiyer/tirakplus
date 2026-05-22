import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, CitySummary, ExperienceSummary, HomeEntryPath, SafetyContent } from "../../shared/contracts";
import { AudienceCtaBand } from "../components/home/AudienceCtaBand";
import { CityOverview } from "../components/home/CityOverview";
import { HomeHero } from "../components/home/HomeHero";
import { HomeTrustBand } from "../components/home/HomeTrustBand";
import { SafetyMessageBand } from "../components/home/SafetyMessageBand";
import { MusePoseImage } from "../components/muse/MusePoseImage";
import { Button } from "../components/ui/Button";

type HomeData = {
  brand: { name: string; promise: string };
  cities: CitySummary[];
  highlights: string[];
  entryPaths: HomeEntryPath[];
};

type PublicHomeState =
  | { status: "loading" }
  | { status: "ready"; home: HomeData; bangkokExperiences: ExperienceSummary[]; safety: SafetyContent }
  | { status: "error"; message: string };

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export function PublicHome() {
  const [state, setState] = useState<PublicHomeState>({ status: "loading" });

  useEffect(() => {
    Promise.all([
      getJson<HomeData>("/api/public/home"),
      getJson<ExperienceSummary[]>("/api/public/experiences?city=bangkok"),
      getJson<SafetyContent>("/api/safety/content"),
    ])
      .then(([homeData, bangkokExperiences, safety]) => {
        setState({ status: "ready", home: homeData, bangkokExperiences, safety });
      })
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load Tirak Plus.",
        });
      });
  }, []);

  if (state.status === "loading") {
    return (
      <div className="public-home">
        <section className="home-loading" aria-label="Loading home content">
          <MusePoseImage variant="thinking" label="Muse thinking while home content loads" className="home-loading-muse" />
          <div className="home-loading-copy">
            <div className="loading-line loading-line-short" />
            <div className="loading-line loading-line-title" />
            <div className="loading-line" />
          </div>
        </section>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="public-home">
        <section className="error-panel" role="alert">
          <p className="eyebrow">Content unavailable</p>
          <h1>We could not load Tirak Plus.</h1>
          <p>{state.message}</p>
        </section>
      </div>
    );
  }

  const bangkok = state.home.cities.find((city) => city.slug === "bangkok");

  return (
    <div className="public-home">
      <HomeHero brandName={state.home.brand.name} brandPromise={state.home.brand.promise} />
      <HomeTrustBand highlights={state.home.highlights} />
      {bangkok ? (
        <CityOverview city={bangkok} experiences={state.bangkokExperiences} />
      ) : (
        <section className="empty-panel">
          <p className="eyebrow">City overview</p>
          <h2>Bangkok overview is temporarily unavailable.</h2>
          <p>Use discovery while the city guide is unavailable.</p>
        </section>
      )}
      <section className="city-link-band" aria-labelledby="city-link-title">
        <div>
          <p className="eyebrow">More city contexts</p>
          <h2 id="city-link-title">Choose the city first.</h2>
        </div>
        <div className="city-link-actions">
          <Button as={Link} to="/cities/phuket" variant="secondary">Phuket</Button>
          <Button as={Link} to="/cities/koh-samui" variant="secondary">Koh Samui</Button>
          <Button as={Link} to="/cities/koh-phangan" variant="secondary">Koh Phangan</Button>
        </div>
      </section>
      <section className="experience-link-band" aria-labelledby="experience-link-title">
        <div>
          <p className="eyebrow">Experience styles</p>
          <h2 id="experience-link-title">Choose the pace and setting for the plan.</h2>
        </div>
        <div className="city-link-actions">
          <Button as={Link} to="/experiences/nightlife" variant="secondary">Nightlife</Button>
          <Button as={Link} to="/experiences/island-explorer" variant="secondary">Island explorer</Button>
          <Button as={Link} to="/experiences/muay-thai-night" variant="secondary">Muay Thai night</Button>
          <Button as={Link} to="/experiences/private-dining" variant="secondary">Private dining</Button>
          <Button as={Link} to="/experiences/local-guidance" variant="secondary">Local guidance</Button>
        </div>
      </section>
      <SafetyMessageBand content={state.safety} />
      <AudienceCtaBand entryPaths={state.home.entryPaths} />
    </div>
  );
}
