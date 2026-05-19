# Muse Auto-Evolution Loop

Muse should improve through a reviewed keep-or-discard loop, not by freely rewriting itself.

## Experiment Loop

1. State the research question.
2. Record the baseline response.
3. Change one variable: prompt, corpus, retrieval threshold, sanitizer, or eval case.
4. Run the Muse eval suite.
5. Score leakage, safety, voice, helpfulness, and route correctness.
6. Keep the change only if it improves the metric or removes complexity at equal performance.
7. Discard or queue for retest if ambiguous.
8. Version the accepted prompt/corpus/eval change.

## Log Columns

`id | question | baseline | change | metric | result | decision | notes`

The active lightweight log lives at `docs/muse-rag/experiment-log.tsv`. Add a row for every prompt, corpus, retrieval, sanitizer, or eval change that is intended to influence production behavior.

## Candidate Queue

Conversation traces and eval failures can create improvement candidates, but they do not edit prompts directly. Each candidate should identify role intent, stage, pain-point category, severity, signal, and suggested action. Candidates move through `queued`, `testing`, `kept`, or `discarded`.

## Promotion Gate

A candidate can ship only when:

- leakage tests pass,
- safety tests pass,
- Muse voice remains consistent,
- affected traveller/companion fixtures pass,
- corpus/prompt version is bumped,
- review notes are attached to the GitHub issue or PR.
