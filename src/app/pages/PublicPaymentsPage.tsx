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
    label: "Browse",
    title: "No checkout on public pages.",
    description: "Talk to Muse and shape a plan without being pushed toward payment.",
  },
  {
    label: "Plan",
    title: "A request needs context first.",
    description: "City, timing, expectations, and boundaries come before any paid step.",
  },
  {
    label: "Pay",
    title: "Checkout appears inside the signed-in plan.",
    description: "When payments are available, the action stays attached to the plan you are reviewing.",
  },
];

function paymentStatusCopy(provider: PaymentProviderSummary): string {
  if (provider.status === "test_mode") return "Testing";
  if (provider.status === "fallback") return "Available by request";
  return "Coming soon";
}

function paymentProviderNote(provider: PaymentProviderSummary): string {
  if (provider.status === "test_mode") {
    return "Card checkout is being tested before it appears in live plans.";
  }

  return "This method will appear only when it is ready for signed-in plans.";
}

export function PublicPaymentsPage() {
  const [state, setState] = useState<PaymentState>({ status: "loading" });

  useEffect(() => {
    getPaymentProviders()
      .then((providers) => setState({ status: "ready", providers }))
      .catch((caught: unknown) => {
        setState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Unable to load payment methods.",
        });
      });
  }, []);

  return (
    <div className="public-business-page public-payments-page">
      <section className="public-business-hero" aria-labelledby="public-payments-title">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 id="public-payments-title">Checkout stays inside a confirmed plan.</h1>
          <p className="lede">
            Public pages never ask for payment. When checkout is available, it appears with the plan details in one
            signed-in place.
          </p>
          <div className="action-row">
            <Button as={Link} to="/safety" variant="primary">Read safety guidance</Button>
            <Button as={Link} to="/" variant="secondary">Start with Muse</Button>
          </div>
        </div>
        <aside className="payment-status-panel" aria-label="Payment method status">
          <p className="eyebrow">Current status</p>
          <h2>Payments are not open yet</h2>
          <p>
            Talk to Muse and shape a plan now. Checkout appears only when the signed-in plan is ready.
          </p>
        </aside>
      </section>

      <section className="public-section" aria-labelledby="payment-flow-title">
        <div className="public-section-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="payment-flow-title">No pressure, no surprise checkout.</h2>
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
          <p className="eyebrow">Payment methods</p>
          <h2 id="provider-status-title">Methods will appear when they are ready.</h2>
          {state.status === "error" ? <p>{state.message}</p> : null}
        </div>
        <div className="public-provider-list">
          {state.status === "ready"
            ? state.providers.map((provider) => (
                <article className="public-provider-row" key={provider.id}>
                  <span>{provider.label}</span>
                  <strong>{paymentStatusCopy(provider)}</strong>
                  <p>{paymentProviderNote(provider)}</p>
                </article>
              ))
            : (
              <article className="public-provider-row">
                <span>Payment methods</span>
                <strong>Loading</strong>
                <p>Checking which methods can be shown here.</p>
              </article>
            )}
        </div>
      </section>
    </div>
  );
}
