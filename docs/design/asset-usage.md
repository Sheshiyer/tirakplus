
# Asset Usage

## Approved Direction Assets

- Existing logo source: /Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/socials/image 1 1.png
- App icon candidate: /Users/sheshnarayaniyer/Downloads/tirakplus-app-icon-gpt-image-2.png
- Icon family sheet: /Users/sheshnarayaniyer/Downloads/tirakplus-icon-family-sheet-gpt-image-2.png
- Brand board candidate: /Users/sheshnarayaniyer/Downloads/tirakplus-brand-board-gpt-image-2.png
- UI repair visual contract: `docs/design/ui-repair-contract.md`
- Active responsive reference boards: `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/`
- Active mobile treatment concepts: `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/gpt-image-2-dark-pass/`

## Rules

- The app icon candidate is the primary app icon direction, but production export sizes and transparent variants must be generated in a later asset pass.
- The icon family sheet is a style guide for UI icons. Individual icons must be regenerated or extracted into separate transparent assets before use.
- The brand board is staging guidance only. It contains generated text and a generated lifestyle portrait and must not ship directly.
- No generated portrait is production-approved until source, consent, moderation, and brand review are complete.
- Visual assets must support mobile, tablet, desktop, and wide desktop layouts without text overlays on busy imagery.
- Reference boards and mobile concepts are implementation references, not production assets. Do not crop phone chrome, labels, cards, generated copy, or complete board fragments into the app.
- Muse imagery must preserve the accepted character identity across mobile, tablet, and desktop variants unless a new persona is explicitly approved.
- Mobile Muse/profile imagery should be close and scene-integrated. Do not use a distant full-body character poster inside narrow protected app cards.
- The active Muse foreground family is `public/assets/muse/scene/muse-mobile-portrait-foreground-alpha.png`, `public/assets/muse/scene/muse-tablet-portrait-foreground-alpha.png`, and `public/assets/muse/scene/muse-desktop-portrait-foreground-alpha.png`; the former side/full-body pose pack is superseded and must not be wired into product UI.

## Production Asset Needs

- App icon exports: 1024, 512, 256, 192, 180, 128, 64, 32.
- Transparent brand mark: SVG or PNG with verified edge quality.
- UI icon set: traveller, companion, nightlife, island explorer, Muay Thai night, Bangkok, Phuket, Koh Samui, Koh Phangan, trust/safety.
- Placeholder imagery policy: use reviewed local/staged assets only; no broken remote placeholders and no generated people in production without review.
- Responsive Muse media: mobile close scene, tablet scene, desktop/wide scene, and mark-only fallback states. The current transparent foreground family is registered for this pass; future replacements must preserve the same approved character identity.
