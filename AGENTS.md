# Tirak Plus Customer App Agent Instructions

## Working directory / repo context (READ FIRST)

**Canonical path:** `Tirak/standalone-repos/tirakplus/` — this directory.
Remote: `https://github.com/Sheshiyer/tirakplus.git`

**There is a duplicate at `Tirak/tirakplus/` (one level up + sideways).**
That copy is NOT its own git repo — it lives inside the vault repo
(`github.com/Sheshiyer/kkv2-astro-wiki.git`). The vault also hosts the
inspiration boards at `Tirak/tirakplus/generated/web-reference-boards/`,
which is why the path comes up in agent prompts. **Reading from there
is fine. Writing or running `git` from there is NOT.**

Symptoms of being in the wrong dir:
- `git remote -v` returns `kkv2-astro-wiki.git`
- `git status` shows ~6900 files of `.agents/skills/*` deletions
- IDE/session header shows "kkv2-astro-wiki" as the active project

**Always run `bash scripts/agent-preflight.sh` at session start.** It
asserts cwd remote == `tirakplus.git` and exits 1 otherwise. The
pre-commit hook installed via `bash scripts/install-git-hooks.sh`
makes the same check before any commit lands.

If your shell `cd` gets reset (zoxide config quirk on this machine
sends bare `cd` calls to the wrong tirakplus), always use absolute
paths in `Bash` tool calls: `cd /Volumes/madara/2026/Projects/thoughtseed/tirak/standalone-repos/tirakplus && ...`

<!-- SPECKIT START -->
Primary spec-kit plan:
- Tirak Plus Customer App: specs/001-tirakplus-customer-app/plan.md

Shared source-of-truth documents:
- .specify/memory/constitution.md
- DESIGN.md
- docs/design/responsive-view-matrix.md
- docs/design/component-system.md
- docs/design/asset-usage.md
- docs/payments/stripe.md
- docs/payments/provider-alternatives.md
- docs/issues/backlog-map.md
<!-- SPECKIT END -->

## Project Rules

- Treat DESIGN.md as binding for all UI work.
- Treat docs/issues/backlog-map.md and the linked GitHub issues as the implementation source.
- Do not hardcode mock data in UI components; staged data must come through API-shaped rails.
- Block cheap dating-app, red-light, objectifying, fake-urgency, and swipe-first patterns.
- Stripe is the first payment adapter candidate, not a hard product dependency. Keep provider alternatives in docs/payments/provider-alternatives.md behind the same compliance gate.
