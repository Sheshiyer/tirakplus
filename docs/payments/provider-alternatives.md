# Payment Provider Alternatives Research

Research date: 2026-05-08

## Executive Read

Stripe remains useful as an API baseline, but it is not the only candidate and it is not the safest compliance assumption for Tirak. The best technical direction is a `PaymentProvider` abstraction with provider-specific adapters and a compliance gate.

Recommended provider shortlist to investigate in parallel:

1. KBank K-Payment Gateway for Thai-native bank credibility and API/QR/card rails.
2. SCB Payment Gateway / SCB QR API / SCB PayWise for Thai QR, SCB EASY deep-link, and bank-native review.
3. 2C2P for broad Southeast Asia coverage, many payment methods, hosted page/direct API, and enterprise travel/hospitality fit.
4. Bangkok Bank Merchant iPay for conservative bank-native card and Thai QR coverage.
5. High-risk specialists such as CCBill, Segpay, or Verotel only if the business is explicitly adult/dating and cannot be approved by mainstream Thai rails.

Omise/Opn is technically attractive, but its published restricted-business policy explicitly lists adult services, dating services, and companion/escort services as prohibited. That makes it a poor fit unless the business model is reframed and approved in writing.

## Compliance Reality

Provider selection cannot be judged by SDK quality alone. The business model needs a written merchant supportability decision before live payments are enabled.

High-risk terms to avoid in merchant applications and product copy unless the provider explicitly approves them:

- Escort
- Adult dating
- Companion service
- Sexual service
- Pay per meet
- Massage/adult entertainment
- Dating marketplace

Safer but still review-required positioning:

- Private travel concierge
- Introduction request
- Hospitality planning fee
- Membership / concierge subscription
- Verified adult community with safety operations

No processor should be integrated directly into UI components. The app should expose Tirak-owned APIs first:

- `POST /api/payments/sessions`
- `GET /api/payments/:id`
- `POST /api/webhooks/:provider`
- `GET /api/admin/payments`
- `GET /api/admin/payment-events`

Then adapters can map to Stripe, KBank, SCB, 2C2P, or another provider without changing product flows.

## Provider Matrix

| Provider | Fit | Local Rails | Integration Ease | Approval Risk | Recommendation |
|---|---|---|---|---|---|
| KBank K-Payment Gateway | Thai-native bank acquiring | Cards, bank transfer/payment tools, e-wallet/payment tools, API | Medium | High if adult/dating/escort wording appears | Strong local-bank candidate; run merchant pre-approval first |
| SCB Payment Gateway / QR API / PayWise | Thai-native bank acquiring | Cards, Thai QR, SCB EASY, TrueMoney, Alipay+, WeChat Pay | Medium | High if considered immoral/illegal/high-risk | Strong local-bank candidate, especially Thai QR |
| 2C2P | Regional gateway/orchestration | Cards, QR, wallets, pay-at-counter, banking, hosted payment | Medium | High but enterprise review may be more nuanced | Best gateway/orchestration candidate |
| Bangkok Bank Merchant iPay | Conservative Thai bank acquiring | Cards, Thai QR for legal entities, Alipay+/WeChatPay | Medium-high onboarding friction | High if adult/dating/escort wording appears | Good fallback for bank-native card/QR |
| Omise/Opn | Developer-friendly Thai gateway | Cards, PromptPay, mobile banking, TrueMoney, Rabbit LINE Pay, etc. | Easy | Very high; policy explicitly blocks dating and companion/escort services | Do not prioritize unless model is written-approved |
| GB Prime Pay | Thai gateway | Cards, PromptPay/mobile banking/e-wallets per ecosystem claims | Easy-medium | Unknown; requires direct terms/onboarding review | Keep as secondary research candidate |
| CCBill / Segpay / Verotel | High-risk/adult processing | Global card/high-risk rails, not Thai-native PromptPay | Medium | Lower for adult category, higher fees and brand risk | Only if mainstream providers reject the model |
| Manual bank transfer / PromptPay reconciliation | Local Thai proof-of-demand rail | PromptPay / bank transfer | Easy for prototype, hard to automate safely | Legal/AML/manual ops risk | Use only for controlled concierge validation, not scalable launch |

## Provider Notes

### KBank K-Payment Gateway

KBank's K-Payment Gateway agreement describes support for credit/debit cards, funds transfer, e-wallets, other future payment tools, and an API connection between merchant and KBank systems. It is attractive because it is bank-native, Thai-local, and commercially credible.

Pros:

- Strong local trust signal in Thailand.
- Useful if the product becomes a legitimate Thai hospitality/travel concierge.
- Better Thai-bank relationship path than Stripe.

Risks:

- Requires merchant onboarding and business review.
- Likely requires Thai entity/bank relationship.
- Adult/dating/escort positioning is likely a blocker unless specifically approved.

Research source:

- https://www.kasikornbank.com/en/Download/Pages/TermAndCondition/TC_KPaymentGateway.pdf

### SCB Payment Gateway / SCB QR API / SCB PayWise

SCB documents Payment Gateway, Payment Link, QR API, and PayWise. The product page lists cards, Thai QR, TrueMoney Wallet, Alipay+, WeChat Pay, and SCB EASY payment flows. SCB also states merchant eligibility requires Thailand registration/location, appropriate products/services for card acceptance, and no illegal/immoral business.

Pros:

- Very strong Thai-native payment path.
- Thai QR API is valuable for local users and Thai bank app behavior.
- SCB PayWise may be useful for SCB EASY users.

Risks:

- Merchant approval likely scrutinizes the business category.
- Thai QR can be great for Thai users but less useful for inbound travellers without Thai bank/wallet setup.
- Implementation fee/onboarding can be heavier than API-first PSPs.

Research source:

- https://www.scb.co.th/th/personal-banking/payment/for-merchant/payment-gateway.html

### 2C2P

2C2P supports many Southeast Asian payment methods and has Direct API payment methods for card, 3DS, web payment, QR, wallets, pay-at-counter, self-service machines, and internet/mobile banking. Its site positions itself as a full-suite regional platform with 400+ payment options and server-to-server/mobile/plugin integration.

Pros:

- Best fit for a travel/hospitality-style regional app.
- Good breadth across cards, QR, wallets, and local methods.
- Enterprise review may be more flexible than self-serve processors.

Risks:

- Merchant Service Agreement requires lawful business, required licenses, and goods/services not prohibited by law or good morals or damaging to the provider's image.
- Onboarding likely requires real legal entity and underwriting.
- Direct API can be more complex than Stripe/Omise.

Research sources:

- https://developer.2c2p.com/docs/direct-api-payment-methods
- https://2c2p.com/payment-methods/
- https://prod-2c2pwebsite.2c2p.com/wp-content/uploads/2026/02/27105327/TH-2C2P-MSA-Template_ENG-NEW-Feb-2026.pdf

### Bangkok Bank Merchant iPay

Bangkok Bank Merchant iPay supports online credit/debit card payments for websites and mobile apps, with Visa, Mastercard, UnionPay, JCB, TPN, Alipay/Alipay+, WeChat Pay, and Thai QR payment for legal entities.

Pros:

- Conservative Thai bank path.
- Good for legal-entity Thai QR and card acceptance.
- Useful if the product is positioned as hospitality/travel services.

Risks:

- Branch/application process and document-heavy onboarding.
- Less developer-first than Stripe/Omise.
- Business category review remains the major blocker.

Research source:

- https://www.bangkokbank.com/en/Business-Banking/Manage-My-Business/Merchant-Services/Merchant-iPay

### Omise / Opn

Omise is technically strong and developer-friendly. Its docs list Thai-relevant payment methods including PromptPay, KBank K PLUS, SCB Easy, Bangkok Bank mobile banking, TrueMoney, Rabbit LINE Pay, and more.

However, Omise's restricted-business policy explicitly lists adult services, dating services, and companion/escort services as prohibited. That makes Omise a poor first candidate for Tirak unless the provider approves a narrowed, non-dating, non-adult, legal hospitality/concierge model in writing.

Pros:

- Easiest Thai developer experience among local PSPs.
- Excellent fit for normal Thai e-commerce.
- Broad local payment method docs.

Risks:

- Published policy is directly hostile to adult/dating/companion positioning.
- High shutdown risk if actual product differs from application wording.

Research sources:

- https://docs.omise.co/
- https://omise.co/en/restricted-businesses-omise

### GB Prime Pay

GB Prime Pay appears in Thai commerce ecosystems and is supported by platforms such as Wix for Thailand. It is worth a direct inquiry because it may be easier than bank-direct onboarding for cards/PromptPay-style flows.

Pros:

- Potentially easier onboarding than bank-direct products.
- Thai-focused gateway.
- Could be useful as a secondary local rail.

Risks:

- Public policy and merchant-category details need direct confirmation.
- Treat as unknown until we get written supportability feedback.

Research source:

- https://support.wix.com/en/article/connecting-gb-prime-pay-as-a-payment-provider

### High-Risk Specialists: CCBill, Segpay, Verotel

These are not premium Thai-native rails, but they are relevant if mainstream providers reject the category. CCBill, Segpay, and Verotel publicly position around adult/high-risk processing.

Pros:

- More realistic if Tirak is openly adult/dating/companion.
- Built for higher underwriting and chargeback risk.
- API/hosted payment paths exist.

Risks:

- Fees, reserves, onboarding, and compliance workload are likely much heavier.
- May damage the premium hospitality feel.
- May not support local Thai QR/PromptPay expectations.
- Might force more explicit adult-category classification than the brand wants.

Research sources:

- https://ccbill.com/industries/adult-business
- https://segpay.com/verticals/high-risk/
- https://www.verotel.com/

## Recommended Next Step

Do not choose a provider by coding first. Run a payment supportability sprint:

1. Prepare a one-page merchant brief with exact product wording, legal entity, countries served, pricing model, refund/cancellation policy, and what payments are for.
2. Send the same brief to KBank, SCB, 2C2P, Bangkok Bank, GB Prime Pay, and one high-risk specialist.
3. Ask for written answers to:
   - Can you board this merchant category?
   - Which MCC/category would you assign?
   - Can payments be for membership, concierge planning, introductions, deposits, or marketplace payouts?
   - Are companion/dating/adult terms prohibited even if no explicit content is sold?
   - What KYC/KYB, licenses, refund policy, and content rules are required?
   - Which rails are approved: cards, Thai QR, PromptPay, wallets, bank transfer, payouts?
4. Keep Stripe in the code plan as one adapter, but do not make it the only provider.
5. Implement `PaymentProvider` with `provider = stripe | kbank | scb | 2c2p | bangkok_bank | gbprimepay | high_risk_card | manual_review`.

## Architecture Implication

The current Stripe doc remains correct if renamed mentally as the first provider adapter. The product should not have `StripePaymentRecord` as the core domain object. It should have:

- `PaymentRecord`
- `PaymentProviderAccount`
- `PaymentSession`
- `PaymentWebhookEvent`
- `PaymentComplianceReview`
- `ProviderCapability`

Provider-specific IDs stay in nested metadata:

```json
{
  "provider": "stripe",
  "providerPaymentId": "pi_...",
  "providerSessionId": "cs_...",
  "capabilities": ["card", "promptpay"],
  "complianceState": "provider_approved"
}
```

This keeps Tirak able to move from Stripe to KBank, SCB, or 2C2P without rewriting traveller inquiry or admin oversight flows.
