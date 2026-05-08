import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ApiEnvelope, CompanionPreview, PaymentProviderSummary } from "../shared/contracts";
import "./styles.css";

type HomeData = {
  brand: { name: string; promise: string };
  cities: { slug: string; name: string; tone: string; trustNote: string }[];
  highlights: string[];
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

function App() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [companions, setCompanions] = useState<CompanionPreview[]>([]);
  const [providers, setProviders] = useState<PaymentProviderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<HomeData>("/api/public/home"),
      getJson<{ results: CompanionPreview[] }>("/api/traveller/discovery"),
      getJson<PaymentProviderSummary[]>("/api/payments/providers"),
    ])
      .then(([homeData, discoveryData, providerData]) => {
        setHome(homeData);
        setCompanions(discoveryData.results);
        setProviders(providerData);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load Tirak Plus.");
      });
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="topbar" aria-label="Primary">
          <div className="mark">TP</div>
          <a href="#discovery">Discovery</a>
          <a href="#safety">Safety</a>
          <a href="#payments">Payments</a>
        </nav>
        <section className="hero-grid">
          <div>
            <p className="eyebrow">Bangkok, Phuket, Koh Samui, Koh Phangan</p>
            <h1>{home?.brand.name ?? "Tirak Plus"}</h1>
            <p className="lede">
              {home?.brand.promise ??
                "Private Thailand companion concierge with reviewed discovery and respectful inquiry flows."}
            </p>
            <div className="action-row">
              <a className="button primary" href="#discovery">
                Explore discreetly
              </a>
              <a className="button secondary" href="#companion">
                Companion path
              </a>
            </div>
          </div>
          <div className="trust-panel" aria-label="Trust model">
            {(home?.highlights ?? ["API-shaped staged data", "No hardcoded UI profiles"]).map((item) => (
              <div className="trust-item" key={item}>
                <span />
                {item}
              </div>
            ))}
          </div>
        </section>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="section" id="discovery">
        <div className="section-heading">
          <p className="eyebrow">Traveller flow</p>
          <h2>Discovery uses API rails from day one.</h2>
        </div>
        <div className="profile-grid">
          {companions.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <p className="status">{profile.verificationState.replaceAll("_", " ")}</p>
              <h3>{profile.displayName}</h3>
              <p>{profile.profileTone}</p>
              <p className="meta">{profile.availabilitySummary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section city-section">
        {(home?.cities ?? []).map((city) => (
          <article key={city.slug}>
            <h3>{city.name}</h3>
            <p>{city.tone}</p>
            <p className="meta">{city.trustNote}</p>
          </article>
        ))}
      </section>

      <section className="section split" id="safety">
        <div>
          <p className="eyebrow">Companion flow</p>
          <h2>Visibility stays controlled.</h2>
          <p>
            Companion onboarding starts as draft, moves to verification, and only appears in discovery after review.
          </p>
        </div>
        <div className="quiet-panel">
          <h3>No cheap directory patterns</h3>
          <p>No ratings, fake online urgency, swipe-first layout, or objectifying copy.</p>
        </div>
      </section>

      <section className="section" id="payments">
        <div className="section-heading">
          <p className="eyebrow">PaymentProvider boundary</p>
          <h2>Provider research remains behind compliance review.</h2>
        </div>
        <div className="provider-grid">
          {providers.map((provider) => (
            <article className="provider-card" key={provider.id}>
              <p className="status">{provider.status.replaceAll("_", " ")}</p>
              <h3>{provider.label}</h3>
              <p>{provider.implementationNote}</p>
              <p className="meta">Rails: {provider.localRails.join(", ")}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
