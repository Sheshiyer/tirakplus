# TP-CUST-101 Evidence: Profile Preview Safe View

- Added safe preview panel in `/companion/profile`.
- Preview hides profile, city, availability, or inquiries according to visibility controls.
- Private legal name and private review note are never rendered inside the public preview.
- Verification required: browser smoke toggling visibility controls.
- Anti-pattern check: preview shows reviewed exposure state, not a glamorized public card.
