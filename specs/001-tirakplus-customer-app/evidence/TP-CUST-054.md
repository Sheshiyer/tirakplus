# TP-CUST-054 Evidence: Public Empty/Fallback States

- Public home loading and unavailable states are implemented in `src/app/pages/PublicHome.tsx`.
- City and experience unavailable states are implemented in `src/app/pages/CityOverviewPage.tsx` and `src/app/pages/ExperiencePage.tsx`.
- `npm run contract:smoke` covers public home, public experiences, safety content, and payment provider status so fallback paths stay behind API envelopes.
- Anti-pattern check: fallback copy is neutral and safety-oriented, with no scarcity or browse-volume pressure.
