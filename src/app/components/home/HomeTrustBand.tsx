interface HomeTrustBandProps {
  highlights: string[];
}

export function HomeTrustBand({ highlights }: HomeTrustBandProps) {
  return (
    <section className="home-trust-band" aria-labelledby="home-trust-title">
      <div className="home-trust-card">
        <div className="home-trust-copy">
          <h2 id="home-trust-title">Why Tirak Plus?</h2>
          <p>
            A premium, reviewed approach to Thailand.
          </p>
        </div>
        <ul className="home-trust-list">
          {highlights.map((item) => (
            <li key={item}>
              <span aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
