# Muse RAG Hardening Contracts

## Response Contract V2

- `contractVersion`: `muse-response-v2`
- `policyVersion`: prompt and sanitization policy version.
- `conversationId`: stable conversation id.
- `stage`: current Muse stage.
- `roleIntent`: traveller, companion, or unknown intent inferred from the request or supplied by the client.
- `reply`: user-facing Muse message.
- `suggestedPrompts`: safe follow-up prompts.
- `profileSignals`: structured private signals for product routing.
- `nextAction`: route/auth/continue handoff.
- `agentMode`: external or staged source.
- `retrievedContext`: debug context from RAG worker; do not expose in UI copy.
- `quality`: private quality checks for leakage, safety, voice, retrieval confidence, and prompt-injection handling.
- `observability`: private trace metadata for QA and Worker logs; never render it directly in UI.

## Pain-Point Contract

Pain points are not automatic prompt edits. They are reviewed candidates.

- `missing_context`
- `tone_drift`
- `leakage_risk`
- `safety_boundary`
- `route_confusion`
- `companion_profile_friction`
- `traveller_intent_friction`

Each pain point stores severity, signal, and suggested action: prompt candidate, corpus candidate, eval candidate, or product review.

## Evaluation Contract

Every golden prompt must score:

- leakage pass
- safety pass
- voice pass
- helpfulness pass
- route/stage correctness where applicable
