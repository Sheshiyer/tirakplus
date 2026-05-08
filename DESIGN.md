
# Design System: Tirak Plus

## 1. Visual Theme & Atmosphere

Tirak Plus is a private travel concierge and discreet members-club product for adult travellers and companions in Thailand. It should feel calm, composed, premium, privacy-aware, and locally fluent. It must never look like a cheap dating directory, nightlife flyer, escort classifieds page, or swipe-addicted hookup app.

Design profile:

- Density: 4/10. Gallery-airy on public pages, daily-app balanced inside logged-in workflows.
- Variance: 7/10. Editorial asymmetry on marketing/product discovery, predictable structure inside forms and admin.
- Motion: 4/10. Restrained fluid CSS, no dopamine-loop animation.
- Mood: calm desire, trust, privacy, premium hospitality, and adult agency.
- Public surfaces signal discretion before attraction.
- Product surfaces signal clarity, verification, and safety before conversion.

The visual reference set is:

- Existing Tirak logo: /Volumes/madara/2026/twc-vault/01-Projects/thoughtseed/Tirak/socials/image 1 1.png
- Brand board direction: /Users/sheshnarayaniyer/Downloads/tirakplus-brand-board-gpt-image-2.png
- App icon direction: /Users/sheshnarayaniyer/Downloads/tirakplus-app-icon-gpt-image-2.png
- Icon family direction: /Users/sheshnarayaniyer/Downloads/tirakplus-icon-family-sheet-gpt-image-2.png

The brand board is staging guidance only. Generated lifestyle portraits and generated UI text in that board are not production assets.

## 2. Color Palette & Roles

- Porcelain Canvas (#FAF7F3): Primary background. Warm, quiet, and premium without becoming beige-heavy.
- Pearl Surface (#FFFFFF): Cards, sheets, modals, form sections, and admin work surfaces.
- Charcoal Ink (#26232A): Primary text. Never use pure black for product UI text.
- Soft Slate (#5E5964): Secondary text, helper copy, timestamps, and metadata.
- Veil Border (rgba(38,35,42,0.10)): Dividers, hairlines, input outlines, table boundaries.
- Rose Bronze (#B96F7D): The single action accent for primary CTAs, focus rings, active tabs, and selected controls.
- Rose Bronze Active (#9F5D6A): Pressed and hover state for primary actions.
- Blush Mark (#F4C4C6): Logo and brand-mark use only; not a CTA background.
- Lavender Mark (#B7A6D8): Logo and brand-mark use only; not a decorative glow color.
- Night Plum (#211B2C): Footer, secure auth surfaces, admin dark rails, and high-contrast nav regions.
- Trust Green (#657A66): Verified/safe state accent used sparingly for system status, never as a marketing color.
- Warning Clay (#B16B45): Review-needed state for admin queues and safety workflows.
- Risk Fig (#7E4257): High-risk moderation state; use in admin only.

Rules:

- One action accent: Rose Bronze.
- Logo colors can remain two-tone, but UI does not become a pink/purple gradient product.
- No Thai flag gimmick palette.
- No neon purple/blue, red-light pink, beach-party rainbow, black-and-gold luxury cliche, or casino urgency color.

## 3. Typography Rules

Primary stack:

- Display: Satoshi, Cabinet Grotesk, or Outfit.
- Body: Satoshi or Geist.
- Mono: Geist Mono or JetBrains Mono for audit IDs, timestamps, admin table metadata, and API examples.

Scale:

| Role | Desktop | Tablet | Mobile | Weight | Use |
|---|---:|---:|---:|---:|---|
| Hero display | 56px / 1.05 | 44px / 1.08 | 36px / 1.10 | 600 | Public home and destination lead sections |
| Section display | 40px / 1.12 | 34px / 1.15 | 28px / 1.18 | 600 | Major content bands |
| Screen title | 28px / 1.20 | 26px / 1.20 | 24px / 1.20 | 600 | App screens and admin pages |
| Card title | 18px / 1.30 | 18px / 1.30 | 17px / 1.30 | 600 | Profile cards, queues, panels |
| Body | 16px / 1.55 | 16px / 1.55 | 16px / 1.50 | 400 | Reading text and form help |
| Caption | 13px / 1.40 | 13px / 1.40 | 12px / 1.35 | 500 | Metadata and status copy |
| Mono label | 12px / 1.40 | 12px / 1.40 | 12px / 1.40 | 400 | Admin IDs and audit metadata |

Rules:

- Never use Inter as the premium brand font.
- No generic serif fonts. Serif may appear only in rare editorial campaign surfaces and must not enter dashboards.
- Letter spacing is 0 for body and slightly tight for headings only.
- Copy must say companions, hosts, members, travellers, introductions, verification, availability, plans, privacy, and safety.
- Banned copy: girls, babes, hot, sexy, naughty, hookup, Thai girls, near me now, instant fun, VIP girls, elevate, seamless, unleash, next-gen, ultimate experience.

## 4. Component Stylings

Buttons:

- Primary button: Rose Bronze fill, Pearl text, 999px radius for marketing and app CTAs, 48px minimum height, 16px label.
- Secondary button: Pearl fill, Charcoal Ink text, Veil Border, same dimensions as primary.
- Admin danger button: Pearl fill, Risk Fig text, Risk Fig border, only for moderation or security actions.
- Pressed state: transform translateY(1px) or scale(0.98). No glows or pulses.
- One primary CTA per decision area.

Navigation:

- Public nav: soft floating rail on Porcelain or Night Plum, logo left, restrained links, one primary action.
- App mobile nav: bottom tab bar for Discovery, Plans, Inbox, Safety, Account.
- Admin nav: left rail on desktop/tablet, bottom or drawer nav on mobile, no decorative icons.

Cards and containers:

- Cards are reserved for profiles, itineraries, bookings/inquiries, modals, repeated admin records, and verification objects.
- Do not nest cards inside cards.
- Use dividers, section bands, and negative space before adding another box.
- Profile cards are editorial and verified, not marketplace thumbnails.
- Admin cards are operational and dense enough for repeated work.

Forms:

- Label above input, helper text below label when privacy/safety context matters, error text below input.
- No floating labels.
- Focus ring uses Rose Bronze.
- Sensitive uploads show visibility, retention, and review status.

States:

- Loading: skeletons shaped like the target layout, not circular spinners.
- Empty: quiet, actionable, non-desperate copy.
- Error: direct, recoverable, and privacy-aware.
- Success: restrained confirmation; no confetti or heart explosions.

## 5. Layout Principles

- Home hero is asymmetric. Never center a generic headline over a generic nightlife image.
- First viewport shows the Tirak mark, discreet Thailand companionship promise, and a hint of product workflow.
- Use CSS Grid for responsive layout; avoid fragile flexbox percentage math.
- Avoid generic three-equal-card feature rows.
- Prefer editorial split layouts, itinerary timelines, concierge panels, restrained profile previews, and operational admin queues.
- Preserve clear spatial zones; never place text over faces or busy generated imagery.
- Use min-height: 100dvh for full-height sections; never use h-screen.
- Max content width: 1400px, with narrower reading columns near 65 characters.
- Mobile collapses aggressively to one column with no horizontal scroll.
- Touch targets: at least 44px.

## 6. Depth & Elevation

- Default surface separation is 1px Veil Border and whitespace.
- Use shadows only when elevation communicates hierarchy, such as modals, sticky bars, and profile preview overlays.
- Shadow style: 0 24px 60px rgba(38, 35, 42, 0.08), never harsh black shadows.
- Admin tables use lines and density instead of decorative cards.
- No default glassmorphism. If a frosted surface is required, add a 1px inner border and keep blur subtle.

## 7. Do's and Don'ts

Do:

- Make public surfaces feel like boutique travel/hospitality.
- Make logged-in flows feel private, practical, and respectful.
- Use the interlinked Tirak mark as the icon geometry source.
- Show safety, verification, and privacy before conversion pressure.
- Treat companions as adults with agency, controls, and clear visibility rules.
- Deliver staged data through API-shaped rails.

Don't:

- Do not create a cheap dating-directory grid.
- Do not use ThaiFriendly-style category energy as a model.
- Do not use red-light cues, bikini-led heroes, nightclub collage chaos, or neon glow buttons.
- Do not use star ratings, hot/not mechanics, fake online-now dots, or swipe-first UX as the primary product identity.
- Do not use hardcoded mock data in UI components.
- Do not ship generated portraits or generated UI text without human review.
- Do not use emojis as icons.

## 8. Responsive Behavior

| Breakpoint | Size | Required behavior |
|---|---:|---|
| Mobile | 390x844 | Single-column app shell, bottom-safe actions, no horizontal overflow, 44px touch targets, compact filters in drawers or bottom sheets. |
| Tablet | 768x1024 | Two-column layouts where useful, persistent secondary panels only when readable, admin queues can show list plus detail. |
| Desktop | 1280x800 | Full nav, asymmetric hero/product surfaces, discovery filters can sit in side rails, admin uses left nav and split panes. |
| Wide desktop | 1440x900 | Content maxes near 1400px, gutters absorb width, no stretched cards, admin tables add columns only when useful. |

Mandatory screen coverage:

- Home
- Traveller discovery
- Companion profile
- Traveller onboarding
- Companion onboarding
- Auth
- Inquiry flow
- Safety center
- Account/settings
- Admin dashboard
- Verification queue
- Moderation queue
- User management
- Audit log

## 9. Agent Prompt Guide

Use this prompt when asking an agent to design Tirak screens:

Build Tirak Plus using the project DESIGN.md. The result must feel like a discreet private travel concierge and members club for adult travellers and companions in Thailand. Use Porcelain Canvas, Pearl Surface, Charcoal Ink, and Rose Bronze as the single action accent. Preserve the Tirak interlinked mark language from the app icon and icon sheet. Avoid cheap dating-app patterns, red-light cues, objectifying language, neon glows, swipe-first UX, star ratings, fake online urgency, and hardcoded mock data. Design responsive mobile 390x844, tablet 768x1024, desktop 1280x800, and wide 1440x900 variants. Include loading, empty, error, and safety/privacy states.
