# TP-CUST-107 Evidence: Availability Save Flow

- Availability form saves through `PATCH /api/companion/availability`.
- API field errors render for missing windows, short labels, and insufficient notes.
- Success state confirms the API rail saved the availability draft.
- Verification required: valid save API probe and invalid save API probe.
- Anti-pattern check: save flow is operational and private, without booking-pressure language.
