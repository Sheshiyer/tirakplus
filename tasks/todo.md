# Tirak Plus Companion Phase

## Companion Registration, Profile Management, Availability

- [x] Review Phase 5 spec tasks T086-T115 and map them to a single coherent implementation slice.
- [x] Add API-shaped companion contracts for onboarding, draft profile, visibility, availability, review states, and companion inbox.
- [x] Add Worker endpoints for `/api/companion/onboarding`, `/api/companion/profile`, `/api/companion/visibility`, `/api/companion/availability`, `/api/companion/submit-verification`, and `/api/companion/inquiries`.
- [x] Add staged companion data behind Worker routes only; keep UI free of hardcoded staged profile or availability data.
- [x] Build companion onboarding, dashboard, profile editor, availability, inbox, account, and safety views with premium/discreet copy.
- [x] Verify mobile, tablet, and desktop layouts do not produce cheap dating-app, red-light, objectifying, fake-urgency, swipe-first, or person-rating patterns.
- [x] Run TypeScript/build checks, API probes, and browser smoke checks.
- [x] Mark spec tasks T086-T115 complete and attach evidence files.
- [x] Commit and push the customer repo.

## Review

- `npm run check` passed after companion contracts, routes, UI, and evidence were added.
- API probes covered onboarding, dashboard, companion inquiries, profile validation, availability validation/save, and verification submit validation/success.
- Browser smoke covered companion dashboard, onboarding, profile, availability, inbox, and safety at `390x844`, `768x1024`, and `1280x800` with no horizontal overflow.
- Browser console recheck reported no console errors or page errors across companion routes.

# Tirak Plus API Boundary Phase

## Phase 6: API Contracts, Staged Data Rails, Data Model, Cloudflare Boundary

- [x] Review Phase 6 spec tasks T116-T130 and map them to route, provider, schema, storage, and contract-test work.
- [x] Add a typed API route registry that covers public, auth/session, traveller, companion, payment, safety, account, and system routes.
- [x] Add a staged data provider boundary so Worker handlers do not import staged arrays directly.
- [x] Add schema and Cloudflare storage boundary artifacts for D1, R2, and KV.
- [x] Harden response envelopes with request ID propagation and consistent error shape.
- [x] Add missing safety/account API rails and keep payment behind the compliance gate.
- [x] Add a contract smoke harness that verifies API envelopes, request IDs, validation errors, and representative endpoints.
- [x] Mark spec tasks T116-T130 complete and attach evidence files.
- [x] Run TypeScript/build checks, contract smoke, API probes, and git diff checks.
- [x] Commit and push the customer repo.

## Review

- `npm run check` passed after request ID propagation, route registry, staged provider, storage/schema contracts, and role-gated APIs were added.
- `npm run contract:smoke` passed 26 checks against `http://127.0.0.1:8787`.
- Contract smoke covered system, public, auth, traveller, companion, payment, safety, and account endpoints.
- The harness caught and forced correction of the Stripe compliance gate so `PAYMENT_PROVIDER_NOT_APPROVED` is now a proper API error envelope.
- Browser smoke confirmed traveller discovery/profile, wrong-role companion redirect, companion dashboard/onboarding, and no mobile horizontal overflow after API role-gating.

# Customer Public Closeout + Phase 7 QA

## T050-T055 and T131-T140 Batch

- [x] Review remaining public-home and QA tasks and map them to one implementation slice.
- [x] Tighten keyboard, screen-reader, contrast, overflow, privacy, and session-security surfaces without changing product flow.
- [x] Verify public home/Muse entry, auth, traveller, companion, safety, settings/account, and API routes across mobile/tablet/desktop where practical.
- [x] Add evidence files for TP-CUST-050 through TP-CUST-055 and TP-CUST-131 through TP-CUST-140.
- [x] Mark the completed tasks in `specs/001-tirakplus-customer-app/tasks.md`.
- [x] Run `npm run check`, `npm run contract:smoke`, targeted API probes, and browser/visual smoke checks.

## Review

- Added skip links and `main#main-content` landmarks to public, traveller, and companion shells.
- Added consistent `:focus-visible` treatment for nav links, buttons, form fields, code inputs, and Muse chat controls.
- Added common API security headers through the JSON/error response helpers.
- `npm run check` passed.
- `npm run contract:smoke` passed 26 checks against `http://127.0.0.1:8787`.
- Targeted API probes confirmed public home and Muse chat response envelopes plus request/security headers.
- Browser MCP loaded `/` and `/overview` with zero warnings/errors; Chrome headless produced public mobile/tablet/desktop screenshot evidence.

# Muse PNG Recovery Pass

## Recenter UI Around Image-Based Muse

- [x] Inspect GitHub/customer issue state and identify where the 3D direction needs correction.
- [x] Update issue/backlog language so Wave 1 uses PNG Muse poses, not GLB/model-viewer runtime assets.
- [x] Replace the app's Muse model runtime component with an image-based pose component.
- [x] Update the asset registry and CSS so Muse PNGs are decorative/supportive, responsive, and do not force layout.
- [x] Run checks and visual smoke, then update evidence/notes for the changed direction.

## Review

- GitHub issue #141 now blocks Wave 1 GLB/model-viewer usage and requires PNG Muse poses.
- Created GitHub issue #142 for the PNG recovery pass and added an implementation status comment.
- Replaced `MuseModel` with `MusePoseImage`, a plain PNG component.
- Removed active `.glb`/pose-pack assets and switched `AssetRegistry.muse.poses` to PNG paths.
- Removed Muse art from auth to avoid concept-board leakage.
- Reworked root Muse copy/composition toward the existing reference board using DOM/CSS, not embedded board crops.
- `npm run check` passed.
- Source audit shows no `model-viewer`, `MuseModel`, `.glb`, or `pose-pack` references in `src/app` or `public/assets/muse`.
- Correction after review: this pass is not visually accepted. It solved the runtime problem but failed the actual inspiration-board match because Muse became a decorative PNG and the root did not preserve the chat-first screen composition.

# Muse Reference Audit Reset

## Inspiration-First Plan

- [x] Re-open the actual generated reference boards before doing more UI implementation.
- [x] Review GitHub issues #141 and #142 against the user's correction.
- [x] Add the missing visual-reference QA protocol document referenced by #141.
- [x] Record that the first PNG recovery pass is a failed visual QA pass, not a completed visual implementation.
- [x] Update local lessons so future visual work starts from the boards before code.
- [x] Update GitHub #142 with the rejected-pass status and stricter board-match acceptance criteria.
- [x] Start the next implementation pass only after the reference-driven plan is acknowledged.

## Reference Findings

- Muse root/splash must match `muse-character-splash-responsive-board.png`: full-scene dark shell, dominant Muse character, actual bottom chat input, secure-channel/status module, privacy/trust rail, and intentional desktop/wide composition.
- Think of the landing page as a composited scene: Thailand city/night backdrop layer, foreground Muse character layer, real DOM chat/status layers, and subtle scroll/pointer parallax to create depth.
- The background and Muse assets should be generated/exported separately where possible; production should not crop the complete board into the app.
- `muse-landing-responsive-board.png` is useful for prompt-card/trust-rail/navigation density, but it is secondary to the character splash board for the first screen.
- Traveller discovery is a dark recommendation workspace with filter rails/sheets and card grids. It should not become a generic dashboard.
- Companion profile and inquiry are dark operational flows with strong privacy, verification, availability, and CTA hierarchy.
- Settings/privacy is intentionally light and account-management focused. It should not inherit the dark Muse splash treatment.

## Review

- The plan now treats current screenshots as failed visual evidence below the `4/5` closeness gate.
- The next UI pass should rebuild composition around the reference boards with real DOM/CSS, not board crops and not 3D viewer constraints.

# Muse Layered Scene Pass

## Root Landing Implementation

- [x] Generate a clean Thailand night/city backdrop layer for Muse root.
- [x] Generate a foreground Muse pose and create an alpha cutout for desktop/tablet placement.
- [x] Rebuild the root Muse page as layered backdrop, foreground character, DOM secure-channel card, routing card, chat transcript, suggestions, and bottom composer.
- [x] Add restrained pointer parallax with reduced-motion fallback.
- [x] Preserve the existing Muse chat/API flow while changing the visual composition.
- [x] Capture responsive screenshots at `390x844`, `768x1024`, `1280x800`, and `1440x900`.
- [x] Run `npm run check` and source audit for blocked 3D/model-viewer references.

## Review

- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/muse-layered-pass/`.
- The implementation now follows the layered-scene direction: city backdrop, Muse foreground, real DOM chat/status UI, and subtle parallax.
- Visual closeness is materially improved over the rejected PNG recovery pass. Current self-score: `3.8/5`; it is close enough to continue refinement, but still needs polish before #142 should close.
- Remaining gap: Muse asset quality and crop still need final art direction. The generated cutout works for the UI pipeline but is not yet the final approved production character asset.

# Muse Animation And Parallax Pass

## Static Frame Motion Wiring

- [x] Fix city backdrop stacking so the generated background is visibly rendered above the page base layer.
- [x] Reduce vignette strength so the Bangkok/Thailand city asset reads in the first viewport.
- [x] Wire pointer parallax across backdrop, ambient glow, Muse foreground, copy, secure card, routing card, and chat panel.
- [x] Add CSS motion for backdrop drift, lantern glow, Muse idle float, secure orbit rotation, progress pulse, and panel settling without hiding static screenshots.
- [x] Re-pin the chat panel into the first viewport after the visible scene pass expanded the composition.
- [x] Capture updated screenshots at `390x844`, `768x1024`, `1280x800`, and `1440x900`.
- [x] Run `npm run check`.

## Review

- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/muse-animation-pass/`.
- The city backdrop is now visible and participates in parallax instead of being buried behind the section background.
- Static-frame animations are CSS-only and include a reduced-motion fallback.
- Remaining visual gap: the current Muse foreground crop still needs final art polish, but the layered scene and animation pipeline are now wired.

# Muse Foreground Polish Pass

## Character Art And Crop

- [x] Generate or derive a better screen-ready Muse foreground asset for the landing scene.
- [x] Replace the current floating/full-body crop with a more reference-like upper/three-quarter foreground composition.
- [x] Tune desktop, tablet, and mobile character placement against the visible city backdrop.
- [x] Preserve chat readability and parallax wiring while removing clipped status/routing cards from the first frame.
- [x] Capture updated responsive screenshots.
- [x] Run `npm run check`.

## Review

- Added the clean foreground asset at `public/assets/muse/scene/muse-splash-foreground-hero-alpha.png`.
- Pointed the Muse registry splash/foreground asset to the new alpha PNG.
- Simplified the landing composition to city backdrop, Muse, title, and chat; removed secondary copy/status/routing leakage from the first-frame visual.
- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/muse-foreground-polish-pass/`.
- Verification passed with `npm run check`.

# Muse 4/5 Visual QA Refinement

## Reference-Gate Work

- [x] Recompare current `/` screenshots against the active Muse character splash board.
- [x] Restore missing reference elements as real DOM/assets: Tirak Plus 3D mark, secure-channel module, compact composer, and trust rail.
- [x] Inspect the Muse 3D resource handoff and use it as material/asset reference without reintroducing a runtime 3D viewer.
- [x] Keep secondary panels from clipping behind the chat surface.
- [x] Capture refreshed `390x844`, `768x1024`, `1280x800`, and `1440x900` screenshots.
- [x] Run source audit for blocked 3D/model-viewer references.
- [x] Run `npm run check`.
- [x] Update GitHub #141/#142 with the visual QA result and close only if the `4/5` gate is defensible.

## Review

- Restored the generated Tirak Plus/Muse 3D brand assets from `tirakplus/generated/muse-assets/gpt-image-2/` into `public/assets/brand/`.
- Updated the public top nav and Muse entry hero to use the actual 3D mark assets instead of a CSS-drawn placeholder.
- Inspected `generated/muse-3d/` handoff files: `muse-character.obj`, `muse-character.mtl`, `build_muse_model.py`, and `muse-character-viewer.html`; kept them as reference/source handoff only, not runtime app dependencies.
- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/muse-4of5-refinement/`.
- Source audit passed with no `model-viewer`, `MuseModel`, `.glb`, or `pose-pack` references in active app/public Muse assets.
- `npm run check` passed.

# Muse Copy, Glass Nav, And Chart Flow Wave

## Implementation Plan

- [x] Add a concise Muse tagline and adjust root/overview copy so Muse reads as a named personality, not a generic assistant label.
- [x] Upgrade the top navigation pill to a more liquid glass surface while preserving contrast and touch targets.
- [x] Add a reusable Muse chart contract and staged API data for traveller and companion flows.
- [x] Render the Muse chart on root chat, traveller discovery/profile, companion onboarding, dashboard, and profile-management surfaces.
- [x] Keep chart language user-facing: rhythm, mood, boundary, visibility, fit; do not expose astrology/zodiac/vimshottari internals.
- [x] Run focused source search for banned brand terms in visible UI.
- [x] Capture screenshots for root, traveller discovery, companion onboarding, and companion dashboard.
- [x] Run `npm run check`.

## Review

- Added the Muse tagline `Private Thailand, tuned to your rhythm.` across the Muse entry and chart opening state.
- Added reusable `MuseChartSignature` contracts and staged chart responses for Muse chat, traveller discovery, companion profiles, companion onboarding, and companion dashboard.
- Added `MuseChartPanel` and wired it into root Muse chat, traveller discovery, companion profile, companion onboarding, companion dashboard, and companion profile manager.
- Upgraded the top nav to a liquid glass pill and fixed contrast after screenshot review.
- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/muse-copy-chart-flow/`.
- Source audit found no visible `AI`, `concierge`, `lotus`, or `muse-ai` terms in active app/source evidence surfaces searched.
- `npm run check` passed.

# Chat Mode, Dev Personas, And 70% QA Pass

## Implementation Plan

- [x] Add a home-to-chat transition so the first Muse message moves the user out of the scenic landing frame into a focused chat interface.
- [x] Keep the chat interface responsive across mobile, tablet, and desktop without hiding the composer or overflowing the transcript.
- [x] Add deterministic dev-user rails for traveller and companion so QA can enter protected flows without manual email/code friction.
- [x] Add staged dummy profiles and asset references through API-shaped data rails, not hardcoded component fixtures.
- [x] Replace obvious placeholder/meta-copy in public menu routes and protected secondary routes with product copy that reads launchable.
- [x] Run a 70% design QA pass across root, public menu routes, traveller flow, companion flow, settings/privacy, and protected role switching.
- [x] Use GPT Image 2 only if existing approved assets are insufficient for dummy profile/testing surfaces.
- [x] Capture responsive screenshot evidence and run `npm run check`.

## Review

- Muse now switches into `data-chat-active="true"` on the first submitted message. Desktop expands the chat panel into a focused workspace; mobile reveals the full transcript and keeps the composer inside the viewport.
- Added login-page QA access for `dev.traveller@tirakplus.local` and `dev.companion@tirakplus.local` using the existing staged verification route.
- Added profile image support to the shared companion contract and staged data, then rendered portraits in discovery cards and profile detail.
- Added four dummy profile assets under `public/assets/profiles/`; the Sora asset was generated with GPT Image 2 at `generated/profile-assets/gpt-image-2/companion-test-profile-sora.png`.
- Replaced public placeholder menu routes with launchable safety, discovery, payment, and traveller-plan copy.
- Browser verification confirmed active chat layout at `1280x800` and `390x844`, zero console warnings/errors, and no mobile horizontal overflow.
- Screenshot evidence lives in `specs/001-tirakplus-customer-app/evidence/screenshots/chat-dev-qa-pass/`.
- `npm run check` passed.

# Issue Board Cleanup And Phase 1 Closeout

## Implementation Plan

- [x] Inventory open GitHub issues before creating any new issue.
- [x] Identify the only remaining local spec phase: Phase 1 T001-T020.
- [x] Add evidence files for TP-CUST-001 through TP-CUST-020.
- [x] Mark T001-T020 and validation gates complete in `specs/001-tirakplus-customer-app/tasks.md`.
- [x] Run validation checks for task/evidence coverage, source anti-patterns, and build.
- [x] Close completed GitHub issues in batches with evidence comments.

## Review

- Open GitHub board before cleanup contained issues `#1` through `#141`.
- Local tasks T021-T140 were already complete; T001-T020 were the remaining unchecked customer-app phase.
- No new GitHub issues were created.
- Customer task validation now reports no missing task/evidence references and no unchecked boxes.
- `npm run check` passed after Phase 1 closeout evidence was added.
- Closed GitHub issues `#1` through `#141`; open issue count is now `0`.

# Public Website Flow Pause Before New Issues

Started on 2026-05-19:

- [x] Verify the Tirak Plus GitHub board before creating any new issues.
- [x] Confirm that this pass is for the non-logged-in website flow only.
- [x] Inventory current public routes and their business purpose.
- [x] Identify current functional/UX risks that can look fine in screenshots but break the flow.
- [x] Draft the next issue set as page-specific work without creating issues yet.

## Review

- `Sheshiyer/tirakplus` currently has `0` open issues. Plain `gh issue list` from inside the vault root targets `Sheshiyer/14113-X-vault`, so Tirak Plus issue work must use `gh -R Sheshiyer/tirakplus ...`.
- Non-logged-in routes currently include `/`, `/overview`, `/cities/phuket`, `/cities/koh-samui`, `/cities/koh-phangan`, `/experiences/nightlife`, `/experiences/island-explorer`, `/experiences/muay-thai-night`, `/experiences/private-dining`, `/experiences/local-guidance`, `/discovery`, `/safety`, `/payments`, `/auth/login`, and `/auth/verify`.
- The root route is correctly positioned as Muse-first, but the next phase must verify the functional behavior: initializing/status animation, chat overlay clearing, first-message transition into a real chat workspace, composer reachability, prompt buttons, parallax layering, and mobile bottom-safe interaction.
- The `/overview`, city, experience, safety, payments, and auth surfaces need a business-web pass: refined copy, route-specific purpose, credible trust/compliance framing, dark-mode consistency where intended, responsive layout, loading/empty/error states, and no internal planning language leaking into headings.
- New issues should be created only after this pause is accepted, grouped by public page/route with mandatory browser screenshots at `390x844`, `768x1024`, `1280x800`, and `1440x900` plus visual/functional QA notes.

# Public Website GitHub Issue Setup

Started on 2026-05-19:

- [x] Use Swarm Architect planning rules for phase/wave/swarm issue structure.
- [x] Use GitHub issue creation against `Sheshiyer/tirakplus`, not the parent vault repo.
- [x] Create labels for `phase:public-web`, `wave:w1-public-foundation`, public swarms, public areas, and agent ownership.
- [x] Create a parent wave-control issue and route-specific implementation/QA issues.
- [x] Post a wave summary comment with dependencies, scope boundaries, and validation expectations.
- [x] Replace stale local reference to closed GitHub issue `#142` with the new Muse root issue.

## Review

- Created public non-logged-in wave issue: `#143` `PUB-W1-000`.
- Created Muse root issue: `#144` `PUB-W1-001`.
- Created public shell/nav issue: `#145` `PUB-W1-002`.
- Created overview page issue: `#146` `PUB-W1-003`.
- Created city pages issue: `#147` `PUB-W1-004`.
- Created experience pages issue: `#148` `PUB-W1-005`.
- Created public discovery teaser issue: `#149` `PUB-W1-006`.
- Created safety/privacy issue: `#150` `PUB-W1-007`.
- Created payments/compliance issue: `#151` `PUB-W1-008`.
- Created auth public entry issue: `#152` `PUB-W1-009`.
- Created public API-shaped content/state contract issue: `#153` `PUB-W1-010`.
- Created final public route QA gate issue: `#154` `PUB-W1-011`.
- Parent wave summary comment: https://github.com/Sheshiyer/tirakplus/issues/143#issuecomment-4484620163
- Execution order is contract/state first where needed, then root/shell lock-zone work, then page-specific routes, then final QA gate.
- Every issue includes deliverable, acceptance, validation, dependencies, branch/worktree envelope, lock-zone files, allowed edit surface, and explicit out-of-scope boundaries.

# Public Website Batch Execution

Started on 2026-05-19:

- [x] Keep GitHub issues `#143` through `#154` as the execution boundary while implementing the wave in one integrated batch.
- [x] Replace generic launch surfaces for `/discovery`, `/safety`, and `/payments` with real public pages.
- [x] Harden `/` so Muse status, overlays, first-message transition, prompt chips, and mobile composer behave functionally.
- [x] Refine public shell navigation, overview, city pages, experience pages, and auth entry copy for business-web quality.
- [x] Review public staged API/content and local asset references for broken assumptions.
- [x] Run `npm run check`, API smoke, browser interaction smoke, responsive screenshots, and copy/source audit.
- [x] Comment evidence and close completed GitHub issues `#143` through `#154`.

## Review

- Added real public pages for `/discovery`, `/safety`, and `/payments`; removed the generic launch-surface placeholders from the public route map.
- Hardened Muse root with animated `Initializing Muse` status dots, clearer live status, transcript auto-scroll, first-message active-chat transition, and pointer-safe scene layers.
- Refined public shell navigation, overview CTAs, city page structure, staged public copy, entry-path links, and auth login/verify copy.
- Added standalone `h1` city page heroes so city routes behave as real public business pages, not embedded sections.
- Updated staged public home/city/experience copy and public entry hrefs through API-shaped data rails.
- Screenshot evidence: `specs/001-tirakplus-customer-app/evidence/screenshots/public-web-w1/` with 22 Chrome screenshots across root, overview, discovery, safety, payments, auth, city, and experience routes.
- API probes passed for `/api/public/home`, `/api/public/experiences?city=phuket`, `/api/safety/content`, and `/api/payments/providers`.
- Chrome interaction smoke passed: Muse chat input sends, Muse responds, chat active state engages, public route headings render, auth companion copy appears, dev QA buttons remain, no tested route has mobile horizontal overflow, and console problem count is `0`.
- `npm run check` passed.
- `npm run contract:smoke` passed 26 checks.
- Copy audit found no banned public brand terms in active app/public source; only expected HTML input placeholder attributes and CSS `::placeholder` selectors matched the word `placeholder`.
- Closed GitHub issues `#143` through `#154`; `Sheshiyer/tirakplus` open issue count is back to `0`.

# Logged-In Product GitHub Issue Setup

Started on 2026-05-19:

- [x] Use Swarm Architect planning rules for a logged-in phase/wave/swarm issue structure.
- [x] Keep the issue set focused on protected traveller and companion app views, not public website routes.
- [x] Create labels for `phase:logged-in-product`, `wave:w1-protected-experience`, logged-in swarms, protected areas, and agent ownership.
- [x] Create a parent wave-control issue and 20-25 route/flow-specific child issues.
- [x] Require dark-mode-first bento layouts, visible seeded demo interactions, bookings/sessions/inquiries, and API-shaped staged rails.
- [x] Post a parent wave summary with dependencies, lock-zone boundaries, and final QA expectations.

## Review

- Created logged-in wave parent issue: `#155` `LOG-W1-000`.
- Created protected demo data issue: `#156` `LOG-W1-001`.
- Created dark-mode protected shell issue: `#157` `LOG-W1-002`.
- Created dev persona protected QA rails issue: `#158` `LOG-W1-003`.
- Created traveller dashboard issue: `#159` `LOG-W1-004`.
- Created traveller discovery dark bento issue: `#160` `LOG-W1-005`.
- Created companion card detail-panel issue: `#161` `LOG-W1-006`.
- Created traveller companion profile states issue: `#162` `LOG-W1-007`.
- Created traveller inquiry creation issue: `#163` `LOG-W1-008`.
- Created traveller bookings/sessions list issue: `#164` `LOG-W1-009`.
- Created traveller booking/session detail issue: `#165` `LOG-W1-010`.
- Created traveller inbox/message-thread demo issue: `#166` `LOG-W1-011`.
- Created traveller account/settings dark polish issue: `#167` `LOG-W1-012`.
- Created companion dashboard dark bento issue: `#168` `LOG-W1-013`.
- Created companion onboarding Muse assist issue: `#169` `LOG-W1-014`.
- Created companion profile manager live preview issue: `#170` `LOG-W1-015`.
- Created companion availability/session controls issue: `#171` `LOG-W1-016`.
- Created companion inquiry inbox decisions issue: `#172` `LOG-W1-017`.
- Created companion booking/session detail issue: `#173` `LOG-W1-018`.
- Created companion safety/privacy controls issue: `#174` `LOG-W1-019`.
- Created Muse protected bento placement issue: `#175` `LOG-W1-020`.
- Created non-empty demo-state replacement issue: `#176` `LOG-W1-021`.
- Created protected responsive QA fixes issue: `#177` `LOG-W1-022`.
- Created logged-in interaction smoke harness issue: `#178` `LOG-W1-023`.
- Created final logged-in QA gate issue: `#179` `LOG-W1-024`.
- Parent wave summary comment: https://github.com/Sheshiyer/tirakplus/issues/155#issuecomment-4484762585
- Execution order is staged demo data and shell/dev QA first, then traveller and companion route groups, then Muse placement/non-empty state integration, responsive QA, interaction smoke, and final QA gate.

# Logged-In Product Batch Execution

Started on 2026-05-19:

- [x] Refresh contract/API context and confirm issue boundary `#155` through `#179`.
- [x] Add logged-in demo contracts and staged API rails for traveller dashboard, sessions, and companion session detail states.
- [x] Implement dark protected shell, route loading, and shared logged-in bento primitives.
- [x] Implement traveller dashboard, discovery polish, profile/inquiry polish, inbox, sessions list, and session detail.
- [x] Implement companion dashboard, onboarding, profile manager, availability, inbox decision states, session detail, safety, and account polish.
- [x] Run type/build checks, contract smoke, API probes, responsive screenshots, and logged-in interaction smoke.
- [x] Comment evidence and close GitHub issues `#155` through `#179`.

## Execution Notes

- Active implementation repo: `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/standalone-repos/tirakplus`.
- Target GitHub repo: `Sheshiyer/tirakplus`.
- Keep public web routes intact; this wave is scoped to protected traveller and companion app views.

## Review

- Added protected logged-in contracts and API rails for traveller dashboard, traveller sessions, traveller session detail, and companion routed inquiry detail.
- Replaced traveller default route with `/traveller/dashboard`, a Muse-led private board with active review, plans, metrics, saved reviewed profiles, and route guidance.
- Replaced the traveller `/plans` placeholder with real sessions list and detail pages backed by staged Worker endpoints.
- Added companion inquiry detail with review-safe decision cards, checklist, Muse reply help, and payment/privacy state.
- Moved traveller and companion protected shells to dark mode, added protected route loading copy, and repaired bento/card cascade so legacy light page rules do not leak into the protected app.
- Polished account copy and role-switch QA rails for traveller/companion development testing.
- Extended `scripts/contract-smoke.mjs` to cover the new logged-in endpoints.
- Validation passed: `npm run check`.
- Validation passed: `npm run contract:smoke` with 30 checks.
- Screenshot/interaction evidence: `specs/001-tirakplus-customer-app/evidence/screenshots/logged-in-w1/` with 16 protected-route screenshots across traveller and companion desktop/mobile surfaces.
- Browser/CDP smoke passed: tested route headings rendered, no horizontal overflow, no console warning/error count on the sampled routes, and corrected dark protected card backgrounds.
- Posted evidence comments and closed GitHub issues `#155` through `#179`.
- `gh -R Sheshiyer/tirakplus issue list --state open` returned open issue count `0`.

# Launch Gap Board And Execution Waves

Started on 2026-05-19:

- [x] Confirm the correct standalone repo/remote before creating GitHub issues.
- [x] Create grouped GitHub issues for Brand, Muse Consistency, Product Flow, Security/Data, and Quality Release Waves 1-3.
- [x] Brand wave: wire metadata, favicon/manifest, robots, sitemap, and public trust links.
- [x] Muse consistency wave: remove banned Muse wording from RAG-visible surfaces and add copy guardrails.
- [x] Product flow wave: add legal/support/not-found routes and production account copy.
- [x] Security/data wave: add security docs, env examples, and production session/storage notes.
- [x] Quality release wave 1: add CI for install/check/build and contract smoke.
- [x] Quality release wave 2: add route/browser/copy QA scripts.
- [x] Quality release wave 3: add deployment, domain, asset provenance, and release-readiness docs.
- [x] Run verification and update GitHub issues with execution evidence.

## Issue Map

- `#181` Brand identity, metadata, favicon, and public trust surfaces.
- `#182` Muse consistency, RAG wording, and brand-copy guardrails.
- `#183` Product flow legal/support/404/account/route completeness.
- `#184` Security/data session, request, rate-limit, and storage boundary posture.
- `#185` Quality Release Wave 1: CI, typecheck, build, contract smoke.
- `#186` Quality Release Wave 2: browser, accessibility, visual QA harness.
- `#187` Quality Release Wave 3: deployment, domain, asset, and release docs.

## Review

- Added launch metadata, app icons, manifest, robots, sitemap, and security.txt.
- Added Privacy, Terms, Cookies, Support, Not Found, and Bangkok public routes.
- Added public footer links for legal, support, and safety surfaces.
- Replaced account-page development wording with production account/privacy/security copy while keeping role preview available for QA.
- Removed `private AI concierge` wording from Muse RAG prompt/corpus and renamed the default prompt id to `muse-private-guide`.
- Added `scripts/copy-audit.mjs`, `scripts/route-audit.mjs`, `npm run quality:release`, and GitHub Actions CI.
- Added `.env.example`, `SECURITY.md`, brand vocabulary, production security boundaries, deployment notes, release readiness, and asset provenance docs.
- Verification passed: `npm run copy:audit`, `npm run route:audit`, `npm run check`, `npm run quality:release`, and `npm run contract:smoke` with 30 checks.
- Route sanity passed for `/privacy`, `/terms`, `/cookies`, `/support`, `/cities/bangkok`, wildcard SPA route, manifest, robots, and sitemap.

# Runtime Hardening Wave

Started on 2026-05-19:

- [x] Create GitHub issues for runtime security, CSRF, rate-limit, and smoke coverage.
- [x] Add browser security headers for app/static navigation responses.
- [x] Add staged CSRF token issuance and verification for cookie-authenticated mutation routes.
- [x] Add staged in-memory rate-limit guardrails for auth, Muse, inquiry, report, and account/companion mutations.
- [x] Extend smoke tests for legal/static/browser launch surfaces and security headers.
- [x] Run `npm run quality:release`, contract smoke, and targeted CSRF/rate-limit probes.
- [x] Update/close GitHub issues `#189` through `#192`.

## Issue Map

- `#189` Runtime security headers for app/static responses.
- `#190` Staged CSRF protection for state-changing APIs.
- `#191` Staged rate-limit guardrails.
- `#192` Legal/static/browser route smoke coverage.

## Review

- Added shared CSP/static security headers and configured Worker-first asset handling so public app routes receive those headers.
- Added per-session staged CSRF tokens, surfaced through session/auth envelopes, and required `X-Tirak-CSRF` on protected state-changing routes.
- Updated client API helpers to retain and send the staged CSRF token.
- Added in-memory staged rate limits for auth, Muse chat, protected mutations, and safety reports.
- Added `scripts/static-smoke.mjs`, `scripts/app-smoke.mjs`, `npm run static:smoke`, and `npm run app:smoke`.
- Extended contract smoke to assert CSRF issuance and missing-CSRF `403 CSRF_TOKEN_REQUIRED`.
- Verification passed: `npm run quality:release`, `npm run app:smoke`, `npm run contract:smoke` with 31 checks, and targeted auth rate-limit probe returning `429 RATE_LIMITED`.
