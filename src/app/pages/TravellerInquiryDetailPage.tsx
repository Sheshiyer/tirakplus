import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { PaymentProviderSummary, TravellerInquiryDetail } from "../../shared/contracts";
import { ApiRequestError, TravellerService } from "../api/traveller";
import { Button } from "../components/ui/Button";
import { FeedbackState } from "../components/ui/FeedbackState";
import { SkeletonCard } from "../components/ui/Skeleton";

type LoadState =
  | { status: "loading"; inquiry?: undefined; message?: undefined }
  | { status: "ready"; inquiry: TravellerInquiryDetail; message?: undefined }
  | { status: "error"; inquiry?: undefined; message: string };

export function TravellerInquiryDetailPage() {
  const { inquiryId } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderSummary[]>([]);
  const [checkoutState, setCheckoutState] = useState<"idle" | "creating">("idle");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!inquiryId) {
      setState({ status: "error", message: "Choose an inquiry before opening its details." });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });

    TravellerService.getInquiry(inquiryId)
      .then((inquiry) => {
        if (!cancelled) setState({ status: "ready", inquiry });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Inquiry detail could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  useEffect(() => {
    let cancelled = false;
    TravellerService.getPaymentProviders()
      .then((providers) => {
        if (!cancelled) setPaymentProviders(providers);
      })
      .catch(() => {
        if (!cancelled) setPaymentProviders([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="inquiry-page">
        <SkeletonCard />
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="inquiry-page">
        <FeedbackState
          variant="error"
          title="Inquiry detail is unavailable"
          description={state.message}
          actionLabel="Back to inbox"
          onAction={() => window.location.assign("/traveller/inbox")}
        />
      </section>
    );
  }

  const { inquiry } = state;
  const paymentReturnState = searchParams.get("payment");
  const stripeProvider = paymentProviders.find((provider) => provider.id === "stripe");
  const isStripeTestMode = stripeProvider?.status === "test_mode";
  const canOpenCheckout = isStripeTestMode || inquiry.paymentState.status === "not_started";
  const paymentHeading =
    paymentReturnState === "success"
      ? "Checkout returned"
      : canOpenCheckout
      ? "Card checkout"
      : inquiry.paymentState.status === "pending_review"
      ? "Payment is waiting"
      : "Payment is paused";
  const paymentCopy = isStripeTestMode
    ? "Stripe test checkout is active on this local build. No live charge will be created."
    : inquiry.paymentState.note;

  const startCheckout = async () => {
    setCheckoutState("creating");
    setCheckoutMessage(null);
    try {
      const result = await TravellerService.createPaymentSession(inquiry.id);
      if (result.status === "created") {
        window.location.assign(result.checkoutUrl);
        return;
      }
      setCheckoutMessage(result.message);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setCheckoutMessage(error.message);
      } else {
        setCheckoutMessage("Checkout could not be opened.");
      }
    } finally {
      setCheckoutState("idle");
    }
  };

  return (
    <section className="inquiry-page" aria-labelledby="inquiry-detail-title">
      <div className="inquiry-success-panel">
        <p className="eyebrow">{inquiry.status.replace("_", " ")}</p>
        <h1 id="inquiry-detail-title">{inquiry.companionDisplayName} inquiry</h1>
        <p>{inquiry.nextStep}</p>

        <div className="inquiry-detail-message">
          <h2>Your message</h2>
          <p>{inquiry.message}</p>
        </div>

        <div className="inquiry-timeline">
          {inquiry.timeline.map((item) => (
            <article key={item.label} className={`timeline-item timeline-item-${item.status}`}>
              <p className="meta">{item.status}</p>
              <h3>{item.label}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>

        <div className="payment-state-panel">
          <p className="meta">Payment</p>
          <h2>{paymentHeading}</h2>
          <p>{paymentCopy}</p>
          {paymentReturnState === "success" && (
            <p className="payment-return-note">Checkout sent you back to Tirak. We will update this plan when confirmation arrives.</p>
          )}
          {paymentReturnState === "cancelled" && (
            <p className="payment-return-note">Checkout was cancelled. Nothing has moved.</p>
          )}
          {checkoutMessage && <p className="payment-return-note">{checkoutMessage}</p>}
          {canOpenCheckout ? (
            <Button type="button" variant="primary" onClick={() => void startCheckout()} disabled={checkoutState === "creating"}>
              {checkoutState === "creating" ? "Opening checkout..." : isStripeTestMode ? "Open test checkout" : "Open checkout"}
            </Button>
          ) : (
            <p className="payment-hold-note">No payment action is available yet.</p>
          )}
        </div>

        <p className="privacy-note">{inquiry.privacyNote}</p>

        <div className="action-row">
          <Button as={Link} to="/traveller/inbox" variant="secondary">
            Back to inbox
          </Button>
          <Button as={Link} to="/traveller/discovery" variant="secondary">
            Open discovery
          </Button>
        </div>
      </div>
    </section>
  );
}
