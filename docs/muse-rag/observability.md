# Muse Observability

Each `/v1/chat` response includes a trace block for QA and operations. The UI should not render this block.

Required fields:

- `traceId`: unique response trace id.
- `policyVersion`: prompt-policy version used for the reply.
- `stage`: resolved conversation stage.
- `roleIntent`: traveller, companion, or unknown.
- `retrievedCount`: number of corpus chunks used.
- `blockedBySafety`: true when safety or prompt-injection handling short-circuits generation.
- `createdAt`: response timestamp.

Quality fields:

- `leakagePass`: no blocked private-method or implementation terms survived sanitization.
- `safetyPass`: the request and reply stayed within safety boundaries.
- `voicePass`: the reply avoids mechanical source/corpus language and stays concise.
- `retrievalPass`: at least one relevant corpus chunk cleared the score threshold.
- `injectionPass`: prompt-injection patterns were not accepted as user instructions.

Use these fields to group failures into prompt candidates, corpus candidates, eval candidates, or product review candidates.
