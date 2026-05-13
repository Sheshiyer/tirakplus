import type { SafetyContent } from "../../../shared/contracts";

interface SafetyMessageBandProps {
  content: SafetyContent;
}

export function SafetyMessageBand({ content }: SafetyMessageBandProps) {
  return (
    <section className="safety-message-band" aria-labelledby="home-safety-title">
      <div>
        <p className="eyebrow">Safety before conversion</p>
        <h2 id="home-safety-title">{content.title}</h2>
      </div>
      <ul className="safety-principle-list">
        {content.principles.map((principle) => (
          <li key={principle}>{principle}</li>
        ))}
      </ul>
    </section>
  );
}
