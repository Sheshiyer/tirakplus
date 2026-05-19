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
