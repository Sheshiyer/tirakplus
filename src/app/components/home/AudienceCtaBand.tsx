import { Link } from "react-router-dom";
import type { HomeEntryPath } from "../../../shared/contracts";
import { Button } from "../ui/Button";

interface AudienceCtaBandProps {
  entryPaths: HomeEntryPath[];
}

export function AudienceCtaBand({ entryPaths }: AudienceCtaBandProps) {
  return (
    <section className="audience-cta-band" aria-labelledby="audience-cta-title">
      <div className="audience-cta-heading">
        <p className="eyebrow">Choose your path</p>
        <h2 id="audience-cta-title">Choose how you want to continue.</h2>
      </div>
      <div className="audience-cta-grid">
        {entryPaths.map((entry) => (
          <article className={`audience-cta-card audience-cta-${entry.role}`} key={entry.role}>
            <p className="meta">{entry.label}</p>
            <h3>{entry.heading}</h3>
            <p>{entry.description}</p>
            <Button as={Link} to={entry.href} variant={entry.role === "traveller" ? "primary" : "secondary"}>
              {entry.role === "traveller" ? "Start traveller flow" : "Start companion flow"}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
