# Muse Promotion Gate

Muse changes are promoted only when they pass five gates.

1. Corpus gate: `npm run muse:corpus` verifies categories, audience metadata, sensitivity, and guardrail-only blocked terms.
2. Eval gate: `npm run muse:eval` verifies traveller, companion, safety, tone, and prompt-injection fixtures.
3. Copy gate: `npm run copy:audit` verifies visible product surfaces do not leak banned brand or implementation language.
4. Release gate: `npm run quality:release` verifies typecheck, build, route audit, static smoke, corpus, and eval together.
5. Human review gate: inspect traveller and companion sample chats for tone, dignity, privacy, and business fit before KV promotion.

No single eval pass is enough to promote a change that weakens product direction. If a generated answer feels technically compliant but cheap, salesy, objectifying, or too mechanical, hold the change and add a fixture.
