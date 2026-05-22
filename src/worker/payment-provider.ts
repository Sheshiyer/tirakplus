import type { PaymentProviderSummary, PaymentSessionResult } from "../shared/contracts";

type PaymentProviderMode = "compliance_hold" | "stripe_test";

type StripeCheckoutSessionPayload = {
  id?: unknown;
  url?: unknown;
  error?: {
    message?: unknown;
  };
};

export type PaymentSessionContext = {
  mode?: PaymentProviderMode;
  stripeSecretKey?: string;
  origin: string;
  inquiryId: string;
  customerEmail?: string;
  amount?: number;
  currency?: string;
};

export function getPaymentProviders(mode: PaymentProviderMode = "compliance_hold"): PaymentProviderSummary[] {
  const stripeStatus: PaymentProviderSummary["status"] =
    mode === "stripe_test" ? "test_mode" : "adapter_candidate";

  return [
    {
      id: "stripe",
      label: "Stripe",
      status: stripeStatus,
      localRails: ["cards", "PromptPay if approved"],
      approvalRisk: "high",
      implementationNote:
        mode === "stripe_test"
          ? "Test-mode Checkout is enabled for local verification only."
          : "First adapter candidate only; live charges stay disabled pending written approval.",
    },
    {
      id: "kbank",
      label: "KBank K-Payment Gateway",
      status: "research",
      localRails: ["cards", "bank transfer", "payment tools", "e-wallets"],
      approvalRisk: "high",
      implementationNote: "Strong Thai bank candidate; requires merchant pre-approval.",
    },
    {
      id: "scb",
      label: "SCB Payment Gateway / QR API",
      status: "research",
      localRails: ["Thai QR", "SCB EASY", "cards", "TrueMoney"],
      approvalRisk: "high",
      implementationNote: "Strong Thai QR candidate; category approval is the blocker.",
    },
    {
      id: "2c2p",
      label: "2C2P",
      status: "research",
      localRails: ["cards", "QR", "wallets", "internet banking", "pay-at-counter"],
      approvalRisk: "high",
      implementationNote: "Best orchestration candidate for regional hospitality positioning.",
    },
  ];
}

export const paymentProviders = getPaymentProviders();

export async function createPaymentSession(
  provider: PaymentProviderSummary["id"],
  context: PaymentSessionContext,
): Promise<PaymentSessionResult> {
  if (provider !== "stripe") {
    return blockedPaymentSession(provider);
  }

  if (context.mode !== "stripe_test") {
    return blockedPaymentSession(provider);
  }

  if (!context.stripeSecretKey?.startsWith("sk_test_")) {
    return {
      status: "blocked",
      code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
      provider,
      message: "Stripe test checkout is enabled, but the server is missing a Stripe test secret.",
    };
  }

  const amount = Number.isFinite(context.amount) ? context.amount : 250000;
  const currency = context.currency?.trim().toLowerCase() || "thb";
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("client_reference_id", context.inquiryId);
  body.set(
    "success_url",
    `${context.origin}/traveller/inbox/${encodeURIComponent(context.inquiryId)}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  );
  body.set("cancel_url", `${context.origin}/traveller/inbox/${encodeURIComponent(context.inquiryId)}?payment=cancelled`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", currency);
  body.set("line_items[0][price_data][unit_amount]", String(amount));
  body.set("line_items[0][price_data][product_data][name]", "Tirak Plus private planning test");
  body.set("metadata[inquiry_id]", context.inquiryId);
  body.set("metadata[environment]", "stripe_test");
  if (context.customerEmail) body.set("customer_email", context.customerEmail);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json().catch(() => ({}))) as StripeCheckoutSessionPayload;
  if (!response.ok) {
    const message =
      typeof payload.error?.message === "string" ? payload.error.message : "Stripe could not create a Checkout Session.";
    return {
      status: "blocked",
      code: "PAYMENT_PROVIDER_ERROR",
      provider,
      message,
    };
  }

  if (typeof payload.id !== "string" || typeof payload.url !== "string") {
    return {
      status: "blocked",
      code: "PAYMENT_PROVIDER_ERROR",
      provider,
      message: "Stripe returned an incomplete Checkout Session.",
    };
  }

  return {
    status: "created",
    provider,
    checkoutSessionId: payload.id,
    checkoutUrl: payload.url,
  };
}

function blockedPaymentSession(provider: PaymentProviderSummary["id"]): PaymentSessionResult {
  return {
    status: "blocked",
    code: "PAYMENT_PROVIDER_NOT_APPROVED",
    provider,
    message: "Payment is not available for this plan yet.",
  };
}
