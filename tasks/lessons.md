# Lessons

## 2026-05-18: Do Not Let 3D Assets Drive Tirak Plus UI

- Correction: the Muse 3D/model-viewer route made the UI worse by forcing layout and interaction around an unstable asset pipeline.
- Rule: Wave 1 Muse should use curated PNG pose assets with fixed art direction, predictable aspect ratios, and simple CSS motion only.
- Rule: do not introduce GLB/model-viewer/mesh placement into customer screens until the static PNG interface is visually approved and launchable.
- Rule: when a visual reference board exists, preserve the board's layout intent first; character assets must support the UI, not reshape it.

## 2026-05-18: Do Not Crop UI Boards Into Production Characters

- Correction: using generated full-screen boards as cropped UI images leaks concept text and layout fragments into the app.
- Rule: reference boards are layout/spec references, not production character assets.
- Rule: only place clean standalone PNGs in product UI; if the available PNG contains labels, phone chrome, panels, or board text, use it only for visual comparison.
- Rule: when a screen concept already defines composition, implement the layout around that composition with real DOM/CSS/components rather than embedding pieces of the concept image.

## 2026-05-18: Inspect Inspiration Before More UI Code

- Correction: the PNG recovery pass changed implementation mechanics before fully re-reading the inspiration boards, so it missed the actual chat-first Muse composition.
- Rule: after a visual correction from the user, stop implementation and inspect the reference boards/screenshots first.
- Rule: record the visual target in `docs/design/visual-reference-qa.md` before editing screen code.
- Rule: do not treat a technical cleanup as done when the visual closeness gate has not been met.

## 2026-05-18: Do Not Let Concept Labels Leak Into The Product Frame

- Correction: secondary copy, status, and routing panels were peeking behind the chat surface and made the landing frame look like a pasted concept board instead of a product UI.
- Rule: first-screen Muse composition should prioritize the generated city backdrop, standalone Muse foreground, and real chat interface.
- Rule: hide or relocate secondary diagnostic/status UI when it clips behind the primary chat panel.
- Rule: verify every visual pass at mobile, tablet, and desktop widths before calling the composition close.

## 2026-05-18: Inspect The Full Asset Handoff Before Recreating Brand Marks

- Correction: the Muse refinement pass recreated a placeholder mark from another project brief and missed the already-generated Tirak Plus 3D logo/app-icon asset family.
- Rule: before drawing or approximating a brand mark, inspect `generated/muse-assets`, `public/assets/brand`, and the design resource folder for approved assets.
- Rule: use generated brand assets as product inputs when they exist; CSS-drawn marks are only acceptable as temporary debug placeholders.
- Rule: 3D mesh/source files can inform materials and motion, but Wave 1 customer UI still ships image assets unless a runtime 3D viewer is explicitly re-approved.

## 2026-05-18: Muse Branding Must Not Say AI Or Concierge

- Correction: the Muse screen and evidence copy used explicit "AI" and "concierge" labels even though the brand decision is to let Muse read as a named personality.
- Rule: visible product UI should say "Muse", not "AI Muse", "AI concierge", or "Muse concierge".
- Rule: technical/legal disclosures can explain automation in terms and privacy contexts, but brand surfaces should not carry that language.
- Rule: do not reuse visual motifs from unrelated project briefs; the Tirak Plus loop mark is the approved brand icon direction.

## 2026-05-19: Do Not Echo Planning Language As Product Copy

- Correction: implementation notes and user phrasing were leaking into H1/H2/body copy as meta descriptions instead of being translated into launchable product language.
- Rule: treat user direction as product intent, then write concise interface copy for the target user.
- Rule: route placeholders are not acceptable for the 70% QA pass; every reachable menu item needs a plausible launchable surface or a deliberate redirect.
- Rule: once Muse interaction starts, move from landing composition into a focused chat workspace instead of keeping the user inside the scenic home frame.

## 2026-05-21: Pasted Payment Secrets Stay Out Of Source

- Correction: Stripe test-mode work can be requested with real-looking keys pasted into chat, but those values still must not enter tracked files.
- Rule: never commit pasted secret keys to source, docs, screenshots, or examples.
- Rule: provide `.dev.vars.example` and deployment-secret names with placeholders only.
- Rule: server code should read payment secrets from environment bindings; React code must never receive secret keys.
- Rule: recommend rotating any secret key pasted into chat after local testing.

## 2026-05-21: Preserve Muse Character Identity Across Generated Variants

- Correction: the first tablet generation changed Muse from the requested female guide concept into a male guide.
- Rule: mobile, tablet, and desktop variants of the same Muse asset must preserve the same character identity unless the user explicitly asks for another persona.
- Rule: reject generated variants that change gender, age category, brand tone, or role before wiring them into the product.
- Rule: use a successful approved variant as a reference or source crop when creating responsive variants, instead of relying on a fresh text prompt that can drift.

## 2026-05-21: Do Not Stack Or Glow The App Icon Over Muse 3D

- Correction: the floating Muse trigger stacked the circular 3D Muse/keyframe asset with the purple app icon and a purple aura, creating a double-logo mark.
- Rule: floating Muse entry points should use the 3D/keyframe Muse asset only; app icon and brand mark assets belong to launcher, brand, or auth surfaces.
- Rule: do not add decorative purple aura or gradient overlays to the floating Muse trigger unless the approved source asset includes that treatment.
- Rule: after any icon or asset-layering change, inspect the rendered mobile screenshot for doubled marks, cropped heads, and unintended overlays before calling it done.

## 2026-05-21: Planning Language Is Not Public UI Copy

- Correction: public discovery, safety, payments, and login routes reused internal planning phrases like supportability, rails, gates, routing, and product surface as visible user copy.
- Rule: translate product rules into user-facing actions and promises before writing JSX text.
- Rule: public route copy should describe what the user can do now, what stays private, and where to continue; internal implementation boundaries belong in docs, audits, and safety/compliance notes.
- Rule: add route-specific copy-audit terms whenever a user points out leaked planning language, then verify the affected routes with screenshots.

## 2026-05-21: Active Muse Chat Needs An Exit

- Correction: the focused Muse chat state expanded into a modal-like workspace without an obvious close control.
- Rule: every full-screen or modal-like chat state must include a visible close action at mobile, tablet, and desktop sizes.
- Rule: closing Muse chat should return to the calm home scene and reset active thread UI state unless the user explicitly chooses a route handoff.
- Rule: verify close controls with browser interaction, not only by checking the JSX.

## 2026-05-22: Removing Keywords Is Not Copy Hygiene

- Correction: replacing obvious meta terms still left public pages structured as product explainers with headings like "How it works" and abstract descriptions of the flow.
- Rule: when the user says meta copy is leaking, remove the explainer page structure, not only the flagged words.
- Rule: public Discovery, Safety, Payments, and Login must read as direct app screens with actions, current state, and short field/status labels.
- Rule: screenshot-review the visible text after copy edits; source search alone is not enough.

## 2026-05-22: Public Floor Keeps Muse, Not Payments

- Correction: the public floor direction was inverted; Payments should leave the logged-out floor while Muse remains the main entry architecture.
- Rule: logged-out navigation is Muse, Discovery, Safety, and Login.
- Rule: payment UI belongs inside signed-in plan/inquiry flows unless the user explicitly asks for a public payment education route.
- Rule: before removing a public route, confirm whether the route should be deleted, redirected, or only hidden from navigation.
