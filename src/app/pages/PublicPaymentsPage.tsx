import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ApiEnvelope, PaymentProviderSummary } from "../../shared/contracts";
import { Button } from "../components/ui/Button";

type PaymentState =
  | { status: "loading" }
  | { status: "ready"; providers: PaymentProviderSummary[] }
  | { status: "error"; message: string };

async function getPaymentProviders(): Promise<PaymentProviderSummary[]> {
  const response = await fetch("/api/payments/providers", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const envelope = (await response.json()) as ApiEnvelope<PaymentProviderSummary[]>;
  return envelope.data;
}

const paymentFlow = [
  {
    label: "Before inquiry",
    title: "No payment action appears in public discovery.",
    description: "The public website explains the boundary. Money movement is not part of browsing or profile visibility.",
  },
  {
    label: "After review",
    title: "Inquiry context must clear first.",
    description: "Review checks the route, safety context, service model, and whether a provider can support the exact flow.",
  },
  {
    label: "Provider gate",
    title: "Checkout stays disabled until supportability is approved.",
    description: "Stripe is documented as the target provider, but live activation remains behind the compliance gate.",
  },
];

export function PublicPaymentsPage() {
  const [state, setState] = useState<PaymentState>({ status: "loading" });

  useEffect(() => {
    getPaymentProviders()
      .then((providers) => setState({ status: "ready", providers }))
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load payment provider status.",
        });
      });
  }, []);

  return (
    <div className="public-business-page public-payments-page">
      <section className="public-business-hero" aria-labelledby="public-payments-title">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 id="public-payments-title">Payment rails open only after review.</h1>
          <p className="lede">
            Tirak Plus keeps payment state separate from public discovery. Review, provider supportability, and
            jurisdiction-specific service checks must clear before checkout can appear.
          </p>
          <div className="action-row">
            <Button as={Link} to="/safety" variant="primary">Read safety guidance</Button>
            <Button as={Link} to="/" variant="secondary">Start with Muse</Button>
          </div>
        </div>
        <aside className="payment-status-panel" aria-label="Payment provider status">
          <p className="eyebrow">Current gate</p>
          <h2>Review before payment</h2>
          <p>
            Public discovery never creates instant checkout. The signed-in product can show payment status only after
            an inquiry has enough context for review.
          </p>
        </aside>
      </section>

      <section className="public-section" aria-labelledby="payment-flow-title">
        <div className="public-section-heading">
          <p className="eyebrow">How payment state works</p>
          <h2 id="payment-flow-title">Clear steps, no pressure cues.</h2>
        </div>
        <div className="public-card-grid public-card-grid-three">
          {paymentFlow.map((item) => (
            <article className="public-info-card" key={item.label}>
              <p className="meta">{item.label}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-split-band" aria-labelledby="provider-status-title">
        <div>
          <p className="eyebrow">Provider status</p>
          <h2 id="provider-status-title">Supportability stays visible.</h2>
          {state.status === "error" ? <p>{state.message}</p> : null}
        </div>
        <div className="public-provider-list">
          {state.status === "ready"
            ? state.providers.map((provider) => (
                <article className="public-provider-row" key={provider.id}>
                  <span>{provider.label}</span>
                  <strong>{provider.status.replaceAll("_", " ")}</strong>
                  <p>{provider.implementationNote}</p>
                </article>
              ))
            : (
              <article className="public-provider-row">
                <span>Provider review</span>
                <strong>Loading</strong>
                <p>Checking the staged payment supportability state.</p>
              </article>
            )}
        </div>
      </section>
    </div>
  );
}
