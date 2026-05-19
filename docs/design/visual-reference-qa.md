# Visual Reference QA

This document is the required visual gate for Muse-first customer UI work. It turns the generated boards into implementation constraints without treating those boards as shippable assets.

## Current Decision

- The current Muse PNG recovery pass is not visually accepted.
- The 3D/model-viewer route remains out of scope for Wave 1.
- The next implementation pass must be built from the reference-board composition, not from memory and not from cropped board fragments.
- Generated boards are reference specifications only. Do not crop UI text, phone chrome, labels, cards, or generated interface fragments into production.
- Production Muse artwork must be clean standalone PNG or WebP art with transparent or intentionally composited edges.

## Primary References

| Screen | Reference | Implementation Role |
|---|---|---|
| Muse root / splash / chat entry | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/regenerated-20260518/muse-character-splash-responsive-board.png` | Binding composition reference for the first screen after splash. |
| Muse planning shell | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/muse-landing-responsive-board.png` | Secondary reference for prompt card, trust rail, nav density, and responsive web layout. |
| Traveller discovery | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/traveller-discovery-responsive-board.png` | Binding layout reference for recommendation grid, filters, bottom mobile sheet, and desktop side rail. |
| Companion profile | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/companion-profile-responsive-board.png` | Binding layout reference for profile detail, trust states, availability, and inquiry CTA hierarchy. |
| Inquiry flow | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/inquiry-flow-responsive-board.png` | Binding layout reference for private inquiry composition, date/time selection, plan context, privacy status, and desktop columns. |
| Settings and privacy | `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/settings-privacy-responsive-board.png` | Binding layout reference for the light privacy/account system. This screen should not inherit the dark Muse card treatment. |

## Muse Root Requirements

The root page must read as the Muse entry screen, not a dashboard and not a static marketing page.

- Muse is the dominant visual subject on splash/root, integrated into the scene at mobile and desktop sizes.
- Build the landing scene as layers: generated Thailand city/night backdrop, foreground Muse character, atmospheric foreground accents, and real DOM chat/status UI.
- Use subtle scroll or pointer parallax where it adds depth: backdrop moves slowest, Muse moves slightly faster, UI panels remain stable enough to read.
- Parallax must be restrained and premium. No distracting bobbing, game-like motion, heavy glow loops, or motion that hides the chat input.
- The chat input is a primary first-screen control, bottom-safe on mobile and wide enough on desktop.
- The page has an initializing/secure-channel module and a discreet privacy/trust rail.
- Desktop and wide desktop use intentional web composition: top nav, large character scene, contextual status card, progress module, and bottom prompt.
- Mobile uses a single full-height scene with the prompt reachable without horizontal scroll.
- Do not leak board labels such as viewport names, percentage text copied from the board, or generated mock UI text unless recreated as intentional DOM copy.

## Cross-Screen Visual Rules

- Discovery, companion profile, and inquiry screens use dark operational surfaces with restrained Rose Bronze actions.
- Settings and privacy use the light account-management system from the reference board.
- Use real DOM components for cards, forms, nav, tabs, filters, calendars, and chat.
- Muse character images are supportive scene assets. They must never replace the chat UI, forms, safety copy, or privacy controls.
- Do not reuse contaminated assets from other projects or quarantined folders.
- Do not ship generated people from mood boards as final profile media unless separately approved by source, consent, moderation, and brand review.

## QA Protocol

Every visual implementation issue must attach browser screenshots at these sizes where practical:

- `390x844`
- `768x1024`
- `1280x800`
- `1440x900`

Use this evidence format in issue comments or PR notes:

```md
### Visual Reference QA

- Reference: `generated/.../screen.png`
- Route: `/example`
- Screenshots:
  - Mobile 390x844: `...`
  - Tablet 768x1024: `...`
  - Desktop 1280x800: `...`
  - Wide 1440x900: `...`
- Closeness score: 0-5
- Comparison notes:
- Refinement pass required: yes/no
- Refinement changes made:
```

Score guidance:

- `5`: Production-close to the reference while using real responsive DOM.
- `4`: Directionally matched; minor spacing, typography, or asset polish remains.
- `3`: Recognizable intent but major composition or hierarchy mismatches remain.
- `2`: Uses the same colors/assets but misses the screen structure.
- `1`: Superficial resemblance only.
- `0`: Wrong direction or contaminated reference.

Any score below `4` blocks issue completion and requires another refinement pass.

## Current Gap Register

- The local PNG recovery pass removed the 3D runtime, but it did not restore the reference-board composition.
- The currently placed Muse PNGs are temporary source-view stills and are not final scene art.
- The root page needs a real chat-first layered composition with a generated city backdrop, foreground Muse art, and subtle parallax depth.
- Public-web issue #144 owns the next Muse root functional/visual pass. It must stay open until screenshots and interaction smoke prove a `4/5` or better match against the primary Muse root board and confirm the chat is usable.
