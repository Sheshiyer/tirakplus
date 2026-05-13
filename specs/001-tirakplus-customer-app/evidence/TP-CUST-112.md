# TP-CUST-112 Evidence: Companion Inquiry List

- Implemented `GET /api/companion/inquiries` and `/companion/inbox`.
- Inquiry cards show reviewed planning context, status, preferred window, and privacy note.
- Traveller identity/contact details are intentionally not exposed.
- Verification required: API probe for companion inquiries and browser smoke on `/companion/inbox`.
- Anti-pattern check: list avoids demand counters, online-now cues, and off-platform pressure.
