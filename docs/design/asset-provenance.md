# Asset Provenance

## Approved Active Assets

Brand:
- `public/assets/brand/app-icon.png`
- `public/assets/brand/muse-mark.png`
- `public/assets/brand/tirakplus-muse-app-icon.png`
- `public/assets/brand/tirakplus-muse-icon-192.png`
- `public/assets/brand/icon-exports/icon-{32,64,128,180,192,256,512,1024}.png` *(promoted 2026-05-22 from `generated/muse-assets/gpt-image-2/app-icon-exports/`)*

Muse scene (direction + runtime):
- `public/assets/muse/scene/muse-thailand-night-backdrop.png`
- `public/assets/muse/scene/muse-mobile-portrait-foreground-alpha.png` *(mobile-first portrait foreground, generated 2026-05-24 with GPT Image 2 from approved Muse references; checkerboard raw output superseded)*
- `public/assets/muse/scene/muse-tablet-portrait-foreground-alpha.png` *(tablet transparent foreground derived 2026-05-25 from the approved mobile portrait family)*
- `public/assets/muse/scene/muse-desktop-portrait-foreground-alpha.png` *(desktop transparent foreground derived 2026-05-25 from the approved mobile portrait family)*
- `public/assets/muse/scene/muse-discovery-rooftop-dusk.png` *(promoted 2026-05-26 — generated via gpt-image-2 for `/discovery` immersive hero; Bangkok rooftop dusk with bronze lanterns left foreground, marble bar midground, distant skyline; Muse pose PNG overlays with parallax)*
- `public/assets/muse/scene/muse-safety-morning-suite.png` *(promoted 2026-05-26 — generated via gpt-image-2 for `/safety` immersive hero; private suite at warm morning, brass tea kettle + porcelain cup foreground, linen armchair + books midground, sheer-curtain garden window background)*

Muse floating mark (A2 — ambient presence):
- `public/assets/muse/floating/muse-{appear,idle-float,listen-start,privacy-lock}-{start,end}.png` *(8 keyframes, promoted 2026-05-22 from `generated/muse-3d/keyframes/`)*

Profiles:
- `public/assets/profiles/companion-*.png`

## Rules

- Do not reuse lotus marks or unrelated project models.
- Do not crop complete UI boards into production screens.
- Use standalone PNG assets for Muse until a runtime 3D pipeline is explicitly re-approved.
- Any new generated person/profile asset must be reviewed before use in production.
- Add new approved assets to this file and `src/app/registry/assets.ts`.
- The active UI repair source-of-truth is `docs/design/ui-repair-contract.md`.
- Generated reference boards under `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/web-reference-boards/gpt-image-2/` and mobile concepts under `/Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/tirakplus/generated/screen-concepts/` are provenance references only.
- Generated files in folders prefixed with `_quarantine` or `_superseded` are rejected for production use.
- Rejected exploratory generations, including failed Muse full-body poster/card variants, must remain outside `public/assets`.

## `.crop.ok` Sentinel Mechanism

`scripts/board-crop-audit.mjs` (UIR-058) fails when any PNG under `public/assets/` has dimensions matching a known board contact-sheet size (1920×1080, 1440×900, 2880×1620, 3000×2000) and lacks a sibling `<filename>.crop.ok` sentinel file.

The sentinel is an opt-in: when an asset is intentionally board-shaped (e.g. a deliberate full-bleed scene), create an empty file next to it named `<filename>.crop.ok`. The audit then treats that asset as reviewed and passes. Without the sentinel, the audit assumes the asset is an accidental full-board crop and asks for either a re-crop or an explicit acknowledgement.

## Asset Migration Log

- **2026-05-22**: 18 approved assets promoted from `generated/` per owner confirmation. 6 pre-pose-pack splash variants moved to `public/assets/_superseded/2026-05-22-pre-posepack/` (replaced by canonical render from `muse-splash-contrapposto.glb`). Registry and this file updated.
- **2026-05-24**: Retired the full-body/side-profile Muse pose pack and unused full-screen Muse concept composites from active registry, then moved them to `public/assets/_superseded/2026-05-24-mood-board-muse-poses/`. Added a new mobile-first portrait foreground with alpha and pointed `MusePoseImage` at that foreground so product surfaces no longer render the mood-board poster assets.
- **2026-05-25**: Added tablet and desktop transparent Muse foreground canvases derived from the approved mobile portrait family, then registered all three responsive portrait assets. No retired mood-board pose was restored.

## UI Repair Asset Gates

- `UIR-034` owns the full provenance register update.
- `UIR-035` must accept the reference-derived Muse asset strategy before new Muse character generation or derivation starts.
- `UIR-036` through `UIR-038` must produce separate mobile, tablet, and desktop/wide assets instead of reusing one crop everywhere.
- `UIR-043` must audit that no board labels, phone chrome, generated UI text, or contaminated reference folders are shipped.
