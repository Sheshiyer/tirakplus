# Muse Chat-First Onboarding — Meta-Copy Audit + Design

Date: 2026-05-22 (v2 — re-anchored on existing UIR backlog)
Scope: customer web app (mobile-first), both logged-out and logged-in surfaces
Author: review pass for sheshiyer
Related (binding):
- `docs/design/ui-repair-contract.md` — Phase 1 source of truth, route-ownership matrix
- `docs/design/asset-provenance.md` — approved-asset register, UIR-034/035/043 owners
- `docs/design/asset-usage.md` — approved direction assets + production needs
- `tasks/lessons.md` — 14 dated corrections (2026-05-18 → 2026-05-22)
- `scripts/copy-audit.mjs` — current keyword-only gate
- `docs/issues/backlog-map.md` + `docs/issues/backlog-summary.json` — issue catalog
- live GH repo `Sheshiyer/tirakplus` — 200 issues, 33 OPEN, 5 UI-repair phases

## 0. Why this v2 exists — the regression cause

A first pass (v1 of this doc) produced an audit + chat-first design from scratch. The user pointed out the right correction: **the work already exists as 55 UIR-### issues across phases P1→P5, the copy and asset failures already have open slots, and the regression happened not because the plan was missing but because the enforcement layer is missing.**

The binding contract at `docs/design/ui-repair-contract.md` ends with a `Worker Checklist` (8 bullets per issue: reference used, two-layer responsibility, no board crop, no mock data, breakpoints checked, QA score recorded, `npm run check`, `npm run copy:audit`). **All but the last two are human-enforced** — they live as a markdown checklist that a worker runs at end of task and ticks by hand. The two automated gates (`check`, `copy:audit`) only catch typescript/build breakage and keyword matches.

Today's lesson (`2026-05-22: Removing Keywords Is Not Copy Hygiene`) confirms this is the failure shape: keyword scrub passed; explainer-page structure ("How it works"–style H1/H2 architecture, fake muse-chat-composer in HomeHero, decorative section sprawl on `/`) is what actually leaks. `copy:audit` cannot see structure.

The fix is **three new audit scripts that promote the existing human-checklist items into machine-checkable gates**, plus a sharp mapping of the v1 audit findings onto the existing UIR-### slots so no new issues need to be invented.

## 0.1 Findings → existing issue mapping (no new issues required for the core work)

| v1 finding | Existing OPEN issue | Action |
|---|---|---|
| Make `/` a Muse chat shell; PublicHome → `/about` | **#262 UIR-023** "Phase 3 Muse entry route" (per route-ownership matrix in ui-repair-contract.md §Route Ownership) | Reopen / unblock; attach v1 §3–§4 as the design spec inside the issue |
| In-chat email + OTP turns | UIR-023 + reference: `age-consent-auth-responsive-board.png` (already in §Reference Inventory) | Add an `acceptance:` line to UIR-023 quoting v1 §3.6 verbatim |
| Age-gate as discrete chat turn | UIR-023 + reference board above | Same — extend acceptance criteria |
| Role inference + handoff | **#260 UIR-021** "Unify protected shell navigation and floating Muse coexistence" | Add v1 §3.7 as one acceptance criterion |
| Floating Muse remains pinned post-handoff | UIR-021 (already its scope) | Confirm lessons 2026-05-21 ("Do Not Stack Or Glow The App Icon Over Muse 3D") is referenced |
| Companion onboarding alignment | **#259 UIR-020** "Companion protected dashboard and onboarding" | Already open |
| Replace old assets with new approved Muse media | **#279 UIR-040** "Replace bad dashboard/profile image placements with approved media" | Already open — this is exactly the "still using old assets" complaint |
| Generate mobile/tablet/desktop Muse variants from approved references | **#275 UIR-036**, **#276 UIR-037**, **#277 UIR-038** | All open; gated by #274 UIR-035 |
| Define Muse asset strategy (gate) | **#274 UIR-035** "Define reference-derived Muse asset strategy before generation" | Open — **this is the gate blocking #275/036/037/038** |
| Asset provenance register update | **#273 UIR-034** "Create approved asset provenance register for UI repair" | Open — `docs/design/asset-provenance.md` is the artifact |
| Asset contamination / board-crop audit | **#282 UIR-043** "Add asset contamination and board-crop source audit" | Open — **see §8.3 below for the script** |
| Final asset usage + fallback matrix | **#283 UIR-044** "Document final asset usage and fallback matrix" | Open |
| Responsive Muse/profile media component | **#278 UIR-039** | Open |
| Performance and asset loading audit | **#289 UIR-050** | Open |
| Copy-hygiene regression audit | **#287 UIR-048** "Run copy hygiene and product-language regression audit" | Open — **see §8.1 + §8.2 below for the scripts that make this enforceable** |
| Muse RAG + onboarding scenario regression | **#291 UIR-052** | Open |

**Net new issues required: 3** (one per missing enforcement script — §8 below). Everything else in the v1 plan lives inside existing UIR slots.

## 0.2 Why the prior phases regressed (root cause, not blame)

From `tasks/lessons.md` cross-referenced against `scripts/`:

| Lesson date | Lesson | Enforcement gap |
|---|---|---|
| 2026-05-18 | "Do Not Let 3D Assets Drive Tirak Plus UI" | No CI rejection of GLB/model-viewer imports in `src/app/` |
| 2026-05-18 | "Do Not Crop UI Boards Into Production Characters" | No script greps for `web-reference-boards/` or `screen-concepts/` paths inside `public/assets/` or imports |
| 2026-05-18 | "Inspect The Full Asset Handoff Before Recreating Brand Marks" | No staleness check between `generated/muse-assets/` mtimes and `src/app/registry/assets.ts` references |
| 2026-05-19 | "Do Not Echo Planning Language As Product Copy" | `copy:audit` is keyword-only; structural patterns (H1/H2 cardinality, "How it works"–shape page architecture) pass through |
| 2026-05-21 | "Planning Language Is Not Public UI Copy" | Audit terms added reactively per leak; no test catches the *shape* of explainer copy |
| 2026-05-22 | "Removing Keywords Is Not Copy Hygiene" *(today)* | Same as above, explicitly named — keyword scrub passed, structure leaked |
| 2026-05-22 | "Public Floor Keeps Muse, Not Payments" *(today)* | No route-shape test asserts the public nav set = `{Muse, Discovery, Safety, Login}` |

Three missing scripts, mapped one-to-one onto today's and recent lessons, would close 6 of 14 lesson categories. The remaining 8 are character-identity, asset-stacking, and 3D-pipeline concerns that need a visual/manual gate.



## 0. Why this document exists

The product direction (Muse AI-first launch) and the shipped implementation have drifted apart on three fronts that are visible to a mobile-web visitor:

1. **Meta-copy leaks.** Spec/architecture vocabulary ("workspace", "operating principles", "review state", "traveller workspace metrics", "Open your traveller workspace") is rendered as user-facing UI text. The existing `scripts/copy-audit.mjs` catches several leak classes (e.g. "rails", "gates", "production", "AI concierge") but does not yet catch this softer doc-voice drift.
2. **Two parallel entry surfaces.** `PublicHome` owns `/` and embeds a fake `muse-chat-composer` whose submit button navigates to `/` (no-op). The real `MuseChatPage` exists but is reached secondarily. First-time mobile visitors see a marketing hero with a non-functional chat affordance.
3. **Auth is a separate page.** `AuthStart.tsx` renders a conventional email form with a generic "Sign in to continue" heading and ships dev sample-account buttons. There is no age-gate turn, no per-turn consent, no role inference from intent.

The user asked for both: an audit of the leaks, and a design for collapsing the entry surface + auth into a single Muse-guided chat — including the *how to achieve this*.

---

## 1. Meta-copy audit (mobile-web, both flows)

Audit method: read every file in the `publicSurfaceFiles` and `protectedSurfaceFiles` sets curated by `scripts/copy-audit.mjs`; grep for doc-voice patterns the script does not yet catch; cross-check against DESIGN.md banned vocabulary.

### 1.1 Baseline

`npm run copy:audit` — **passes across 86 files** as of this report. The leaks below are *uncovered* by the current ruleset and should either be removed or added as new patterns.

### 1.2 Findings — public/logged-out surfaces

| File | Line | Offending phrase | Why it leaks | Suggested rewrite |
|---|---:|---|---|---|
| `src/app/components/home/HomeHero.tsx` | 14–16 | `Muse · Bangkok, Phuket, Koh Samui, Koh Phangan` (eyebrow) | Telegraphs nothing; reads as a sitemap | `A private read of Bangkok, Phuket, Koh Samui, Koh Phangan` |
| `src/app/components/home/HomeHero.tsx` | 23–35 | `<form className="muse-chat-composer">` with `Submit → to="/"` | Fake chat affordance; non-functional; misleads first-time visitors | Either remove entirely (when chat shell owns `/`), or wire to real `MuseService.send` |
| `src/app/components/home/AudienceCtaBand.tsx` | 13–14 | `Choose your path` / `Choose how you want to continue.` | Imperative, decision-fatigue voice | Chat shell removes this card entirely; if kept: `Two ways in` / `Travelling — or hosting?` |
| `src/app/pages/PublicHome.tsx` | 89, 91 | `Bangkok overview is temporarily unavailable.` / `Use discovery while the city guide is unavailable.` | Doc voice ("use X while Y is unavailable") | `Bangkok overview is quiet right now. Muse can still walk the city with you.` |
| `src/app/pages/PublicHome.tsx` | 96 | `<h2>Choose the city first.</h2>` | Bare imperative; not a concierge voice | `Where in Thailand, first?` |
| `src/app/pages/PublicHome.tsx` | 107 | `Choose the pace and setting for the plan.` | Same pattern | `Pick the pace and the setting.` |
| `src/app/pages/PublicSafetyPage.tsx` | 81 | eyebrow `Operating principles` | Consultancy-deck voice — pure meta | `How Tirak handles privacy` |
| `src/app/pages/PublicSafetyPage.tsx` | 88 | `Loading verification guidance.` (placeholder array) | Spec-voice loading state | Use a skeleton, not lorem-ipsum-shaped sentences |
| `src/app/pages/PublicDiscoveryPage.tsx` | 66 | `<h2>Open your traveller workspace.</h2>` | Architecture-voice (workspace ≠ user vocabulary) | `Where the plan lives once you sign in.` |
| `src/app/pages/PublicDiscoveryPage.tsx` | 35 | `Continue as traveller` button | Spec voice; "continue" is the system's word | `Sign in as a traveller` (or remove if chat shell owns auth) |
| `src/app/pages/AuthStart.tsx` | 44 | `<h1>Sign in to continue</h1>` | Generic SaaS heading | Muse's voice: `Welcome back. Let's pick up where you left off.` |
| `src/app/pages/AuthStart.tsx` | 76 | `Continue with email` button | Generic | `Send me a code` |
| `src/app/pages/AuthStart.tsx` | 80–82 | `By continuing, you agree to keep messages respectful and to use Tirak Plus for private, safety-aware plans.` | Single line bundles ToS + behavioural ask; not an age-gate | Split into chat turn: (1) age confirm, (2) consent to safety norms — both logged events |
| `src/app/pages/AuthStart.tsx` | 85–95 | `Sample account` dev panel with traveller/companion bypass buttons | **Production leak** — dev affordance visible to every visitor | Move behind `if (import.meta.env.DEV)` |

### 1.3 Findings — protected/logged-in surfaces

| File | Line | Offending phrase | Why it leaks | Suggested rewrite |
|---|---:|---|---|---|
| `src/app/pages/TravellerDashboardPage.tsx` | 54 | `Route board unavailable` | Internal name ("route board") surfacing as user copy | `Today's board is quiet.` |
| `src/app/pages/TravellerDashboardPage.tsx` | 81–82 | eyebrow `Muse support` / `<h2>Keep the route calm.</h2>` | "Route" used as product noun is internal | `<p>Muse</p><h2>How tonight is shaping up.</h2>` |
| `src/app/pages/TravellerDashboardPage.tsx` | 90 | `aria-label="Traveller workspace metrics"` | a11y is fine to use internal labels but "workspace metrics" leaks if read aloud | `aria-label="Your plan-at-a-glance"` |
| `src/app/pages/TravellerDiscovery.tsx` | 88–90 | `Traveller discovery` eyebrow + `Find the right fit for the plan.` | Eyebrow restates page name; voice is fine | Drop the eyebrow, keep the h1 |
| `src/app/pages/TravellerDiscovery.tsx` | 118–119 | `Tune discovery` / `Filter by city, style, and timing.` | "Tune" is internal vocabulary | `Adjust` / `Filter by city, style, and timing.` |
| `src/app/pages/TravellerDiscovery.tsx` | 124 | `Muse tuned` / `City and style are prefilled from your private thread.` | "Private thread" is an internal name | `Muse pre-filled this` / `From your last chat.` |
| `src/app/pages/CompanionDashboardPage.tsx` | 67 | eyebrow `Companion workspace` | Architecture-voice | `Hosting` |
| `src/app/pages/CompanionDashboardPage.tsx` | 68 | `<h1>Set your visibility before discovery.</h1>` | Imperative, not concierge | `Decide what travellers can see — when you're ready.` |
| `src/app/pages/CompanionDashboardPage.tsx` | 99 | eyebrow `Review` + `<h2>Know what travellers can see.</h2>` | Mixed registers (admin + user) | Keep h2; drop eyebrow |
| `src/app/pages/CompanionProfileManagerPage.tsx` | 147 | `<p className="meta">Review state</p>` | "Review state" is a worker enum surfaced raw | `Where this stands` |
| `src/app/pages/CompanionOnboardingPage.tsx` | 170 | eyebrow `Companion registration` | "Registration" is generic SaaS voice | `Hosting profile` |
| `src/app/pages/CompanionOnboardingPage.tsx` | 200 | `<h2>Companion agency comes first.</h2>` | Right *intent*, wordy — "agency" is policy voice | `Your call, every step.` |
| `src/app/pages/MuseChatPage.tsx` | 241, 258 | `Muse is paused. Your Tirak Plus workspace is still available.` | Architecture-voice ("workspace") | `Muse is resting. The rest of Tirak Plus still works.` |

### 1.4 Persona-drift / banned-vocab check

No instances of DESIGN.md's banned persona vocabulary (`girls/babes/hot/sexy/naughty/hookup/near me now/instant fun`) found in `src/app/`.

No instances of DESIGN.md's banned marketing vocabulary (`elevate/seamless/unleash/next-gen/ultimate experience`) found in `src/app/`.

`should/must` appear only in `LegalPages.tsx` where they belong (legal text); not user-facing prose elsewhere.

This is the strong part of the current ship. The remaining drift is architectural ("workspace", "route", "rail-adjacent words like board/state"), not marketing or persona drift.

### 1.5 Recommended additions to `scripts/copy-audit.mjs`

Add to `publicSurfaceBanned` and `protectedSurfaceBanned`:

```js
/\bworkspace\b/i,              // "Companion workspace", "Open your traveller workspace"
/\bregistration\b/i,           // "Companion registration"
/\boperating principles\b/i,   // PublicSafetyPage eyebrow
/\broute board\b/i,            // TravellerDashboard error
/\breview state\b/i,           // CompanionProfileManager meta label
/\bprivate thread\b/i,         // TravellerDiscovery muse-applied panel
/\bcontinue as (?:traveller|companion)\b/i,
/\bsample account\b/i,         // dev panel leaked to prod
```

`aria-label` use of these phrases should be exempted explicitly (e.g. `if (line.includes('aria-label')) continue;`) so a11y labels don't need to be coy.

---

## 2. Mobile-web first — what a 390px visitor actually sees today

Logged-out:
- `/` renders `PublicHome` → marketing hero with a non-functional chat composer, then trust band, city overview, city links, experience links, safety message, audience-CTA cards. **~6 vertical sections** before the first useful action. On a 390×844 viewport this is several scroll lengths before the user understands what to do.
- The "primary action" implicit in DESIGN.md (one CTA per decision) is split between four buttons in the hero alone (Start, Open discovery, Companion path, plus the no-op submit).

Logged-in (traveller):
- After `/auth/login` → `/auth/verify` → `/traveller/dashboard`. The dashboard hero stacks fine on mobile; the bento grid collapses correctly. Meta-copy leaks (above) are the issue, not layout.

Logged-in (companion):
- Lands on `/companion/dashboard`. Mobile-OK structurally. Meta-copy leaks dominate ("Companion workspace", "Set your visibility", "Review state").

The structural verdict: **mobile-layout is sound; the failure mode is vocabulary and entry-surface fragmentation, not breakpoint bugs.**

---

## 3. Muse chat-as-onboarding — the design

### 3.1 The single sentence

**`/` becomes a Muse chat shell. Auth, age-gate, consent, role hint, and the first useful action all happen as turns inside that chat. The legacy public marketing pages move to `/about`, `/safety`, `/cities/*`, `/experiences/*` and are accessible from inside the chat.**

### 3.2 State machine (slot-filling, deterministic skeleton)

Conversation slots Muse must fill before handing off:

| Slot | How collected | Validation | Logged event |
|---|---|---|---|
| `intent` | Free text or chip tap | min 1 token | `muse.slot_filled.intent` |
| `age_18_plus` | Explicit chip: **Yes, 18 or older** / **Not yet** | enum | `muse.age_confirmed` or `muse.age_refused` |
| `consent_v1` | Chip: **I agree to keep messages respectful** | boolean + version pin | `muse.consent_accepted` |
| `email` | Native `<input type="email">` rendered inline | RFC + DNS shape | `muse.email_submitted` |
| `otp` | Native `<input inputmode="numeric" maxlength="6">` inline | matches issued code | `muse.otp_verified` / `muse.otp_failed` |
| `role_hint` | Inferred from intent text; chips offered if low confidence | enum: `traveller \| companion \| undecided` | `muse.role_inferred` |
| `city` *(optional)* | Chip list of 4 cities | enum | `muse.city_hinted` |

Stages map onto Muse's existing `MuseConversationStage` (`arrival → birth_context → travel_context → desire_mapping → safety_boundaries → recommendation_ready`). For first-time-user auth, three new stages are added in front:

```
greet → consent_age → auth_email → auth_otp → arrival → … → recommendation_ready → handoff
```

The state machine is **deterministic** — the LLM is consulted only for paraphrase and intent classification, never for control flow.

### 3.3 First-message script (no LLM call required)

```
[muse] (warm, brief)
Welcome. I am Muse — the quiet way into Tirak Plus.
What brings you here today?

[chips]
• A private evening in Bangkok this week
• A few days on Koh Samui or Phuket
• I would like to host as a companion
• Just looking — show me how this works
```

All four chips bypass marketing pages. The fourth chip routes to a *tour-mode* still inside chat (Muse demonstrates Tirak with stub data, no auth, exit clearly labelled).

### 3.4 Age-gate turn (legally meaningful, logged)

```
[muse]
Tirak Plus is for adults only. One quick check before we go further.
Are you 18 or older?

[chips]  (44px tap targets, no default selection, no "skip")
• Yes, I am 18 or older
• Not yet
```

`Not yet` → closure copy, no retry loop, session ends with `age_refused` event. Refusal is sticky for 30 days on the device (sessionStorage + cookie). Server records the refusal hash so a repeated email cannot bypass it.

### 3.5 Consent turn (separate from age)

```
[muse]
A small agreement before we start: messages on Tirak stay respectful,
private, and practical. Reports stay close to messages and plans.

[chips]
• I agree — let's continue
• Tell me more
```

`Tell me more` expands an inline accordion with safety summary; does *not* navigate away.

### 3.6 Auth turns — email + OTP inside chat bubbles

```
[muse]
What's your email? I will send you a six-digit code.

[input: email]  [button: Send code]
```

On success Muse renders the OTP turn:

```
[muse]
I just sent you a code. Drop it in here.

[input: otp]  [button: Verify]
[small: didn't get it? send again]
```

**Critical contract**: these inline inputs call the existing `useAuth().login(email)` and `useAuth().verify(email, code, role)` — the worker contract does not change. Only the renderer changes.

### 3.7 Role inference + handoff

After OTP verified, Muse already has `intent` text. Heuristic:

- intent matches `(host|companion|sign up.*companion|i am a companion)` → role = `companion`
- intent matches `(plan|trip|evening|night|book|find|see)` → role = `traveller`
- otherwise ask: **"Hosting as a companion, or planning a trip?"** with two chips

Handoff routes:
- `traveller` → `/traveller/dashboard?from=muse&intent=<hash>`
- `companion` → `/companion/onboarding?from=muse`

Muse remains pinned as a floating trigger (the existing `FloatingMuseTrigger`) on every post-handoff page so the conversation can resume.

### 3.8 Fallback when LLM provider is degraded

The chat shell **never blocks on the LLM**. If `MuseService.send` returns 503 / >2s, the deterministic script above continues; only Muse's paraphrase replies switch to canned strings ("Got it.", "Anything else before we go on?"). The user's path to a verified session is unaffected.

### 3.9 Abuse controls

- Cloudflare Turnstile is mounted invisibly inside the chat shell; visible challenge appears only when (a) Turnstile risk score > threshold, (b) >3 OTP failures in 10 min, or (c) >10 messages in 60s.
- Per-IP rate limit on `/api/auth/login` already exists in the worker — unchanged.
- Per-session rate limit on `/api/muse/send` enforced server-side (existing).

### 3.10 Telemetry

Reuse the existing telemetry hook. New events (all flat, no PII beyond hashed email):

```
muse.chat_start                       { device, viewport, referrer_class }
muse.slot_filled                      { slot, length }
muse.age_confirmed | muse.age_refused
muse.consent_accepted                 { consent_version }
muse.email_submitted                  { email_hash }
muse.otp_verified | muse.otp_failed
muse.role_inferred                    { role, source: 'intent'|'chip'|'url' }
muse.handoff                          { role, target_path, turns, duration_ms }
muse.fallback_engaged                 { reason }
```

Drop-off attribution: every abandoned session is tagged with the last filled slot.

### 3.11 Accessibility posture

- Chat log: `role="log" aria-live="polite" aria-relevant="additions"`.
- Composer: visible `<label>`, not just a placeholder.
- Inline auth inputs: `autocomplete="email"` and `autocomplete="one-time-code"` so iOS Mail/Messages can offer the code.
- Chips: `<button>` elements (not `<div>`), 44×44 minimum, focusable in tab order.
- Reduced motion: pose transitions on `MusePoseImage` honour `prefers-reduced-motion`.

### 3.12 Mobile-first CSS posture

- Shell uses `min-height: 100dvh`, never `100vh`.
- Composer container uses `padding-bottom: max(env(safe-area-inset-bottom), 12px)`.
- Keyboard handling: `interactionMode="visualViewport"` — pin the composer above the soft keyboard instead of letting it cover content.
- Single-column on `<768px`; the Muse 3D pose moves to a small avatar in the header instead of the right-side aside.
- Max width 420px for chat bubbles; messages wrap to ≤65 characters.

---

## 4. Implementation architecture

### 4.1 New surface area

```
src/app/shells/MuseShell.tsx                ← owns "/" for unauth users
src/app/pages/MuseHomePage.tsx              ← renders the chat at "/"
src/app/components/muse/MuseConversation.tsx
src/app/components/muse/MuseComposer.tsx
src/app/components/muse/MuseChip.tsx
src/app/components/muse/MuseInlineAuthEmail.tsx
src/app/components/muse/MuseInlineAuthOtp.tsx
src/app/components/muse/MuseAgeGate.tsx
src/app/components/muse/MuseConsentChip.tsx
src/app/state/MuseSessionProvider.tsx       ← React context, reducer
src/app/state/museSlots.ts                  ← slot types + reducer
src/app/state/museTransitions.ts            ← stage transitions
src/shared/contracts/muse-onboarding.ts     ← slot enum, event schemas
```

### 4.2 Route changes

```diff
- <Route path="/" element={<PublicHome />} />                    ← legacy
+ <Route path="/" element={<MuseAuthAwareRoot />} />             ← branches
+   ├─ if (!authed) → <MuseHomePage />                           ← chat shell
+   └─ if (authed)  → <Navigate to={lastRole + '/dashboard'} />

+ <Route path="/about" element={<PublicHome />} />               ← preserved
+ <Route path="/about/safety" element={<PublicSafetyPage />} />
+ <Route path="/about/discovery" element={<PublicDiscoveryPage />} />
```

The existing `MuseChatPage` becomes the *resume* surface for authenticated users — its current `/muse` route stays, but it now starts from the saved `MuseSession` instead of from blank.

### 4.3 Reducer outline

```ts
type Slot = 'intent' | 'age' | 'consent' | 'email' | 'otp' | 'role' | 'city';
type SlotValue = string | boolean;

interface MuseSessionState {
  slots: Partial<Record<Slot, SlotValue>>;
  stage: 'greet' | 'consent_age' | 'auth_email' | 'auth_otp'
       | 'arrival' | 'travel_context' | 'desire_mapping'
       | 'safety_boundaries' | 'recommendation_ready' | 'handoff';
  turns: MuseChatMessage[];
  fallbackMode: boolean;
  abuse: { otpFails: number; lastChallenge?: number };
}

type Action =
  | { type: 'FILL_SLOT'; slot: Slot; value: SlotValue }
  | { type: 'ADVANCE_STAGE' }
  | { type: 'ADD_TURN'; message: MuseChatMessage }
  | { type: 'ENGAGE_FALLBACK'; reason: string }
  | { type: 'OTP_FAILED' }
  | { type: 'RESET' };
```

State persists to `sessionStorage` keyed by a per-session uuid so refresh restores in place.

### 4.4 Reuse, don't replace

- `useAuth().login(email)` and `useAuth().verify(email, code, role)` — unchanged.
- `MuseService.send`, `MuseChartSignature`, `MuseConversationStage` — unchanged.
- `FloatingMuseTrigger`, `MusePoseImage`, `MuseChartPanel` — unchanged.

The change is **additive**: a new shell + state provider that orchestrates existing primitives.

### 4.5 Removal list (after rollout)

- `HomeHero.tsx` fake `<form className="muse-chat-composer">` (lines 23–35) — delete.
- `AuthStart.tsx` "Sample account" panel — gate behind `import.meta.env.DEV`.
- `AudienceCtaBand` — keep on `/about` but remove from default `/`.

---

## 5. Phased rollout

**P0 — Copy cleanup (no architecture change).** Apply the rewrites in §1.2 and §1.3. Extend `scripts/copy-audit.mjs` with the patterns in §1.5. Gate dev sample-account panel. ETA: half a day. Risk: trivial.

**P1 — Chat shell at `/` (auth-aware passthrough).** Add `MuseHomePage` and `MuseSessionProvider`. Route `/` to the chat for unauth users, redirect authed users to their role dashboard. Move `PublicHome` to `/about`. Keep the existing AuthStart page reachable via direct link as a fallback. ETA: 2–3 days. Risk: route map churn; mitigate with a `route-audit.mjs` extension.

**P2 — In-chat auth (email + OTP inside bubbles).** Render `MuseInlineAuthEmail` and `MuseInlineAuthOtp` that call `useAuth().login/verify`. Add age-gate + consent turns. Wire telemetry. ETA: 3–4 days. Risk: keyboard handling on iOS; rehearse on real device.

**P3 — Role inference + handoff.** Heuristic role classifier (regex first, optional LLM later). Hand off to `/traveller/dashboard` or `/companion/onboarding` with intent context. Pin `FloatingMuseTrigger` post-handoff. ETA: 2 days. Risk: misclassification — fall back to explicit chip when confidence < threshold.

**Verification gates per phase:**
- `copy:audit` passes
- `route:audit` passes
- `app:smoke` passes against `/`, `/auth`, `/traveller`, `/companion`
- Mobile screenshot diff at 390×844 against `generated/screen-concepts/gpt-image-2-dark-pass/`
- Manual rehearsal on iOS Safari + Android Chrome
- LLM-down rehearsal (`MUSE_PROVIDER=offline` env flag) — onboarding still completes

---

## 6. Open questions for product

1. Should the unauthenticated "just looking" tour-mode chat use stubbed-companion previews (with privacy-safe synthetic names) or refuse to show companion previews at all until age + consent + auth?
2. Is the `age_refused` retention window of 30 days legally sufficient, or should refusal be sticky per-device-forever (subject to clear-cookies)?
3. After P3, do we keep `/about` reachable from inside chat ("about Tirak Plus") or only via footer?

Answers to these change copy in §3 but not the architecture.

---

## 8. Enforcement layer — the three missing CI gates

The Worker Checklist in `ui-repair-contract.md` becomes machine-checkable when these three scripts are added to `npm run quality:release`. Each closes a specific lesson category and makes a specific OPEN UIR issue actually verifiable.

### 8.1 `scripts/copy-structure-audit.mjs` — closes UIR-048

Goes beyond keyword matching to catch the **shape** of explainer copy:

- public surfaces (`PublicHome`, `PublicDiscoveryPage`, `PublicSafetyPage`, `AuthStart`) must not contain explainer headings (`How it works`, `Choose your path`, `Operating principles`, `Get started`, `Why Tirak`, `What you can do`, `Three steps`, etc.).
- `/` route component (`PublicHome` until P1 of v1 plan ships, then `MuseHomePage`) must render ≤ 2 `<section>` elements above the fold on a 390px viewport. Detected by counting `<section>` opens in the JSX.
- No `<form>` whose only `<button>` navigates to its own route (the fake `muse-chat-composer` pattern in `HomeHero.tsx:23–35`).
- Public nav set must equal exactly `{Muse, Discovery, Safety, Login}` (per 2026-05-22 lesson). Detected by parsing the `<PublicShell>` nav-item array.
- Eyebrow strings under 4 words; H1 strings under 8 words; no H1 ending with a period (telegraph-style).

Fails CI with file:line evidence. Wired into `quality:release`.

### 8.2 `scripts/asset-staleness-audit.mjs` — closes UIR-040 verification gap

Catches the "still using same old assets even though we have new ones generated" failure:

```
For each registry key in src/app/registry/assets.ts:
  - resolve to public/assets/<path>
  - compare mtime to newest matching file in generated/muse-assets/, generated/screen-concepts/, generated/web-reference-boards/
  - if generated/<corresponding>/* mtime > public/assets/<path> mtime AND
    not listed in asset-provenance.md "_superseded" or "_quarantine":
    FAIL with "newer approved asset exists at <generated path>; promote to public/assets and update registry"
```

Also fails if `public/assets/` contains files not declared in `src/app/registry/assets.ts` (drift detection both ways), and if `asset-provenance.md`'s `Approved Active Assets` list disagrees with the registry.

### 8.3 `scripts/board-crop-audit.mjs` — closes UIR-043

Catches the "Do Not Crop UI Boards Into Production Characters" lesson:

- Greps `src/app/`, `public/assets/`, `index.html` for any path containing `web-reference-boards/`, `screen-concepts/`, `_superseded/`, `_quarantine/`.
- Detects `<img>` / `background-image` URLs whose source file lives under `generated/` rather than `public/assets/` (no generated-folder serving in production).
- Detects PNG dimensions in `public/assets/` matching known board sizes (1920×1080, 1440×900 contact sheets) — flags as likely full-board crops; passes when the asset has been validated via a `.crop.ok` sentinel sibling file.
- Fails if a single asset file has been referenced by both `floating Muse` and `app icon` registry keys (closes 2026-05-21 "Do Not Stack Or Glow The App Icon Over Muse 3D").

### 8.4 Wiring into `quality:release`

`package.json` change (one line):

```diff
- "quality:release": "npm run check && npm run copy:audit && npm run route:audit && npm run static:smoke && npm run muse:corpus && npm run muse:eval"
+ "quality:release": "npm run check && npm run copy:audit && npm run copy:structure-audit && npm run asset:staleness && npm run asset:board-crop && npm run route:audit && npm run static:smoke && npm run muse:corpus && npm run muse:eval"
```

Plus three `npm run <name>` shortcuts pointing at the new scripts. Run order: cheap structural checks first so a regression fails fast before the slow `muse:eval` runs.

### 8.5 Three new GitHub issues to file (the only net-new work)

- **UIR-056** — "Add `copy-structure-audit.mjs` and wire into `quality:release`" (P5, wave:qa-release, depends-on: UIR-048)
- **UIR-057** — "Add `asset-staleness-audit.mjs` and wire into `quality:release`" (P4, wave:asset-pipeline, depends-on: UIR-034, blocks: UIR-040)
- **UIR-058** — "Add `board-crop-audit.mjs` and wire into `quality:release`" (P4, wave:asset-pipeline, depends-on: UIR-034, partial-fulfils: UIR-043)

Each issue body: "see `docs/design/muse-chat-onboarding-audit-and-plan.md` §8.{1,2,3}; acceptance = script committed, wired into quality:release, demo-run output attached, and at least one prior regression detected by the new check (regression cases listed in tasks/lessons.md)".

## 9. Sequence (replaces v1 §5 phased rollout)

1. **File UIR-056/057/058** (the three enforcement issues). Half an hour.
2. **Ship UIR-056 first** — `copy-structure-audit.mjs` blocks future planning-language regression while the rest happens. ~3 hours including wiring.
3. **Ship UIR-034 + UIR-057 + UIR-058 together** — asset provenance register + staleness + board-crop audit. ~6 hours; this unblocks UIR-035 → 036/037/038/039/040.
4. **Run UIR-048 with the new gate active** — auto-detects the v1 §1 leaks plus structural drift. Apply rewrites from v1 §1.2 / §1.3. Half a day.
5. **Run UIR-035** — accept the asset strategy (gate). Half a day of taste decisions.
6. **Parallel: UIR-036/037/038/039 + UIR-023** — the asset-pipeline phase produces approved Muse media while UIR-023 ships the chat-shell at `/`. 5–7 days.
7. **UIR-040 + UIR-041 + UIR-042** — swap old assets for new, optimize, audit remaining placements. 2 days.
8. **UIR-021** — pin floating Muse on post-handoff routes per v1 §3.7. 1 day.
9. **UIR-052 + UIR-050 + UIR-055** — Muse RAG/onboarding regression, asset-loading perf, final close-out. 2 days.

Total: ~12 working days, with the first 2 dedicated to making sure phase 11 doesn't have to be phase 12.

## 10. One-screen summary



- The existing `copy:audit` passes; the remaining leak is **doc-voice vocabulary** ("workspace", "operating principles", "review state", "route board", "private thread") in user-facing strings — fixable by rewrite + 8 added patterns in §1.5.
- The fake chat composer in `HomeHero` and the separate `AuthStart` page are the structural drift; the canonical fix is **make Muse own `/`**, render auth as chat turns, infer role, hand off.
- The Muse runtime (stages, chart, service, pose, floating trigger) already exists. The work is a new **`<MuseSessionProvider>` + `<MuseHomePage>`** with deterministic slot-filling that reuses `useAuth().login/verify` for the actual auth contract.
- Phased rollout is P0 (copy cleanup, half-day) → P1 (chat at `/`, 2–3 days) → P2 (in-chat auth, 3–4 days) → P3 (role inference + handoff, 2 days). Each phase gated by existing audit scripts and a mobile screenshot diff.
