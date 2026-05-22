import type { SafetyContent } from "../../../shared/contracts";
import { MusePoseImage } from "../muse/MusePoseImage";

interface SafetyMessageBandProps {
  content: SafetyContent;
}

export function SafetyMessageBand({ content }: SafetyMessageBandProps) {
  return (
    <section className="safety-message-band" aria-labelledby="home-safety-title">
      <div>
        <p className="eyebrow">Safety first</p>
        <h2 id="home-safety-title">{content.title}</h2>
        <MusePoseImage variant="privacy" label="Muse in a composed privacy and safety pose" className="safety-muse-model" />
      </div>
      <ul className="safety-principle-list">
        {content.principles.map((principle) => (
          <li key={principle}>{principle}</li>
        ))}
      </ul>
    </section>
  );
}
