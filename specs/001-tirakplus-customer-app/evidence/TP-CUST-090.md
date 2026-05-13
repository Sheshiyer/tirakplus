# TP-CUST-090 Evidence: City And Experience Step

- Added API-delivered city and experience option sets to companion onboarding.
- Onboarding and profile manager render city selector and multi-select experience controls from API data.
- Worker validates `CitySlug` and `ExperienceSlug` values before accepting profile updates.
- Verification required: API probe with invalid city/experience and browser smoke selecting supported options.
- Anti-pattern check: experiences are itinerary contexts, not person categories or cheap dating filters.
