import type { PaymentProviderSummary, PaymentSessionResult } from "../shared/contracts";

export const paymentProviders: PaymentProviderSummary[] = [
  {
    id: "stripe",
    label: "Stripe",
    status: "adapter_candidate",
    localRails: ["cards", "PromptPay if approved"],
    approvalRisk: "high",
    implementationNote: "First adapter candidate only; live charges stay disabled pending written approval.",
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

export function createPaymentSession(provider: PaymentProviderSummary["id"]): PaymentSessionResult {
  return {
    status: "blocked",
    code: "PAYMENT_PROVIDER_NOT_APPROVED",
    provider,
    message:
      "Live payment creation is disabled until the selected provider approves Tirak's exact business model, jurisdiction, and payment use case.",
  };
}
