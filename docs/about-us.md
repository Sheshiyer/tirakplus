# About Tirak Plus

Tirak Plus is a private, premium web app for Thailand discovery and reviewed introductions. It is designed for travellers who want a more composed way to explore a city or island route, and for companions who need control over public profile tone, visibility, availability, and routed inquiries.

The app is intentionally not a swipe-first marketplace. The first product surface is Muse: a conversational guide that listens for timing, mood, boundaries, and trip context before presenting any protected discovery path. Muse is also present in the companion flow, helping shape bios, profile tone, availability notes, and safe replies without exposing private review material.

## What We Are Building

- A responsive web-only customer app.
- A Muse-led public entry and protected traveller workspace.
- A companion workspace with onboarding, profile management, availability, review states, and routed inquiry decisions.
- A Cloudflare Worker backend with API-shaped staging rails.
- A payment boundary that stays disabled until provider and jurisdiction supportability are formally approved.
- A design system that favors discretion, mature hospitality, and calm review-first behavior.

## Traveller Experience

Travellers begin through Muse rather than a traditional dashboard. After sign-in, the protected traveller workspace shows a private route board, reviewed discovery, companion profiles, private inquiries, plans, session detail, payment state, and account controls.

The traveller flow avoids public rankings, fake demand, online-now pressure, and instant-booking copy. Availability is presented as planning context and review state, not as a promise.

## Companion Experience

Companions use Muse to build and refine a profile while keeping public fields, private review notes, visibility controls, and availability separate. Routed inquiries are shown with review-safe context, decision options, checklist state, and payment/privacy gates.

The companion flow is designed around agency and safety. Public visibility can pause independently from city, availability, and inquiry controls.

## Muse

Muse is the product personality and interaction layer. It should be named as Muse in brand copy, not described as an AI concierge. Compliance, terms, and privacy materials can explain automated assistance plainly, but product surfaces should keep the user-facing brand simple and character-led.

Muse currently uses PNG pose assets in the interface. The 3D route remains optional for later phases after the product flow is stable.

## Safety And Compliance

Tirak Plus keeps review, privacy, routing, and payment states visible in the UI. Payment creation is blocked behind a provider supportability gate. Stripe is documented as an adapter candidate, but the implementation remains behind the `PaymentProvider` boundary so other Thailand or specialist providers can be evaluated without rewriting product flows.

## Current Phase

The public and logged-in customer app waves are implemented with staged data and validation evidence. The next planning phase can create page-specific issues from the current protected surfaces rather than carrying forward the old placeholder backlog.
