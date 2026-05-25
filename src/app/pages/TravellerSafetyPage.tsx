import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const safetyCards = [
  {
    title: "Messages and contact",
    body: "Share only what the plan needs. Keep contact details inside Tirak Plus until both sides are comfortable.",
  },
  {
    title: "Payments",
    body: "Use payment actions only when they appear inside a signed-in plan. Do not move money through chat or outside links.",
  },
  {
    title: "Verification limits",
    body: "Reviewed profiles reduce risk, but they do not replace your judgement. Pause if details do not match.",
  },
  {
    title: "Muse assistance",
    body: "Muse can help organize wording. You can still use every form, plan, and support action without it.",
  },
];

export function TravellerSafetyPage() {
  return (
    <section className="member-page traveller-safety-page" aria-labelledby="traveller-safety-title">
      <div className="member-hero member-hero-compact">
        <div className="member-hero-copy">
          <p className="eyebrow">Safety</p>
          <h1 id="traveller-safety-title">Simple rules for private plans.</h1>
          <p>Use this page for privacy, payment, verification, and reporting guidance. Planning screens stay focused on the plan itself.</p>
          <div className="action-row">
            <Button as={Link} to="/traveller/inbox" variant="primary">
              Open inbox
            </Button>
            <Button as={Link} to="/privacy" variant="secondary">
              Privacy policy
            </Button>
          </div>
        </div>
      </div>

      <div className="member-bento-grid">
        {safetyCards.map((card) => (
          <article key={card.title} className="member-bento-card">
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <section className="member-bento-card member-safety-panel">
        <div>
          <p className="eyebrow">When to report</p>
          <h2>Anything that feels rushed, unclear, or outside the app belongs here.</h2>
        </div>
        <ul>
          <li>Off-platform payment requests.</li>
          <li>Pressure to share personal contact details early.</li>
          <li>Profile details that do not match the conversation.</li>
          <li>Any request that feels unsafe or disrespectful.</li>
        </ul>
      </section>

      <section className="member-bento-card member-safety-panel">
        <div>
          <p className="eyebrow">Support</p>
          <h2>Keep a record before you act.</h2>
        </div>
        <ul>
          <li>Use the inbox or plan thread when details change.</li>
          <li>Screenshot pressure, mismatched details, or payment requests.</li>
          <li>Pause the plan if a boundary becomes unclear.</li>
          <li>Return to Muse for wording help when a message needs to stay calm.</li>
        </ul>
      </section>
    </section>
  );
}
