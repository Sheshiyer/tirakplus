import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

type PolicySection = {
  title: string;
  body: string;
};

const privacySections: PolicySection[] = [
  {
    title: "What Tirak Plus collects",
    body: "Tirak Plus collects account email, role, Muse conversation context, trip preferences, profile information, inquiry details, safety reports, and review states needed to operate private traveller and companion flows.",
  },
  {
    title: "How Muse uses context",
    body: "Muse uses conversation context to help with timing, mood, boundaries, visibility, and route suggestions.",
  },
  {
    title: "Sensitive data boundaries",
    body: "Verification material, private review notes, exact route details, and safety reports stay restricted.",
  },
  {
    title: "Retention and deletion",
    body: "Contact support for deletion, export, correction, or retention questions.",
  },
];

const termsSections: PolicySection[] = [
  {
    title: "Eligibility",
    body: "Tirak Plus is for adults only. Users must be legally eligible in their jurisdiction and in Thailand for the activity they request or offer.",
  },
  {
    title: "Reviewed introductions",
    body: "Discovery, companion visibility, introductions, and payment state depend on review. Tirak Plus does not support instant booking pressure, fake urgency, or off-platform payment requests.",
  },
  {
    title: "Respectful conduct",
    body: "Messages, profiles, and requests must remain respectful, non-objectifying, practical, and aligned with safety boundaries. Unsafe requests can be blocked or reported.",
  },
  {
    title: "Payments",
    body: "Payments appear only inside signed-in plans when checkout is available for that plan.",
  },
];

const cookieSections: PolicySection[] = [
  {
    title: "Required session cookies",
    body: "Tirak Plus uses a secure session cookie to keep signed-in traveller and companion flows available during a browser session.",
  },
  {
    title: "Analytics posture",
    body: "Analytics stay limited and consent-aware.",
  },
  {
    title: "Preference storage",
    body: "Saved preferences cover language, display mode, and notification choices.",
  },
];

function PolicyPage({
  eyebrow,
  title,
  lede,
  sections,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  sections: PolicySection[];
}) {
  return (
    <div className="public-business-page legal-page">
      <section className="public-business-hero public-business-hero-dark legal-hero" aria-labelledby="legal-title">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="legal-title">{title}</h1>
          <p className="lede">{lede}</p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Talk to Muse</Button>
            <Button as={Link} to="/support" variant="secondary">Contact support</Button>
          </div>
        </div>
      </section>

      <section className="public-section legal-section" aria-label={`${eyebrow} details`}>
        <div className="public-card-grid public-card-grid-two">
          {sections.map((section) => (
            <article className="public-info-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Your trip context stays private."
      lede="This policy explains what is collected, how Muse context is used, and how safety records stay restricted."
      sections={privacySections}
    />
  );
}

export function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Reviewed access, respectful use, no pressure."
      lede="These terms cover conduct, review, payments, and account access."
      sections={termsSections}
    />
  );
}

export function CookiesPage() {
  return (
    <PolicyPage
      eyebrow="Cookies"
      title="Only required session cookies."
      lede="Tirak Plus uses required session cookies and keeps tracking limited."
      sections={cookieSections}
    />
  );
}

export function SupportPage() {
  return (
    <div className="public-business-page legal-page">
      <section className="public-business-hero public-business-hero-dark legal-hero" aria-labelledby="support-title">
        <div>
          <p className="eyebrow">Support</p>
          <h1 id="support-title">A clear path when something needs attention.</h1>
          <p className="lede">
            Use support for account access, privacy requests, safety reports, payment questions, or companion
            review status.
          </p>
          <div className="action-row">
            <Button as={Link} to="/safety" variant="primary">Review safety guidance</Button>
            <Button as={Link} to="/privacy" variant="secondary">Privacy policy</Button>
          </div>
        </div>
      </section>

      <section className="public-section legal-section" aria-labelledby="support-options-title">
        <div className="public-section-heading">
          <p className="eyebrow">Support paths</p>
          <h2 id="support-options-title">Choose the right support path.</h2>
        </div>
        <div className="public-card-grid public-card-grid-three">
          {[
            ["Account", "Login, role access, notification, and session help."],
            ["Privacy", "Deletion, export, correction, and visibility requests."],
            ["Safety", "Report unsafe requests, profile concerns, or off-platform pressure."],
          ].map(([title, body]) => (
            <article className="public-info-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="public-business-page legal-page">
      <section className="public-business-hero public-business-hero-dark legal-hero" aria-labelledby="not-found-title">
        <div>
          <p className="eyebrow">Route unavailable</p>
          <h1 id="not-found-title">Muse cannot open that path yet.</h1>
          <p className="lede">
            This page is not available. Start with Muse or return home.
          </p>
          <div className="action-row">
            <Button as={Link} to="/" variant="primary">Talk to Muse</Button>
            <Button as={Link} to="/overview" variant="secondary">Open overview</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
