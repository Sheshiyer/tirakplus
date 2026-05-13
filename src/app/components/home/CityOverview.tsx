import type { CitySummary, ExperienceSummary } from "../../../shared/contracts";

interface CityOverviewProps {
  city: CitySummary;
  experiences: ExperienceSummary[];
}

export function CityOverview({ city, experiences }: CityOverviewProps) {
  return (
    <section className="city-overview" aria-labelledby={`${city.slug}-overview-title`}>
      <div className="city-overview-copy">
        <p className="eyebrow">City overview</p>
        <h2 id={`${city.slug}-overview-title`}>{city.name}</h2>
        <p>{city.tone}</p>
        <p className="city-trust-note">{city.trustNote}</p>
      </div>
      <div className="experience-list" aria-label={`${city.name} experience contexts`}>
        {experiences.map((experience) => (
          <article className="experience-card" key={experience.slug}>
            <p className="meta">{experience.slug.replaceAll("-", " ")}</p>
            <h3>{experience.title}</h3>
            <p>{experience.summary}</p>
            <p className="experience-safety-note">{experience.safetyNote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
