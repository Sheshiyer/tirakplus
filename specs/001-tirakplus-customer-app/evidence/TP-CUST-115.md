# TP-CUST-115 Evidence: Companion Flow Smoke Test

- Companion flow covers dashboard, onboarding, profile editor, availability, inbox, safety, auth role intent, and account switch.
- API rails cover onboarding, profile update, visibility update, availability update, verification submit, dashboard, and inquiries.
- Responsive CSS covers mobile, tablet, and desktop layouts for the companion workspace.
- Verification required: `npm run check`, API probes, and browser smoke across 390x844, 768x1024, and 1280x800.
- Anti-pattern check: no hardcoded UI staged data, ratings, swipe-first mechanics, fake urgency, red-light framing, or objectifying copy.
