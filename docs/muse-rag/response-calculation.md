# Muse Response Calculation

This is the internal calculation contract for Muse. It is intentionally more detailed than the user-facing reply. The user should experience Muse as a private, witty guide, not as a model explaining a pipeline.

## 45-Step Internal Pipeline

1. Read the incoming message.
2. Normalize whitespace and message length.
3. Identify role intent: traveller, companion, unknown.
4. Identify current onboarding stage.
5. Detect whether the user is asking for profile help, trip discovery, safety guidance, or payment/contact handling.
6. Extract birth date if present.
7. Extract birth place if present.
8. Extract birth time if present.
9. Extract city and travel window.
10. Extract experience hints.
11. Extract desired mood.
12. Extract privacy requirements.
13. Extract safety boundaries.
14. Extract companion visibility preferences.
15. Extract companion profile/bio/service wording needs.
16. Detect unsafe or explicit requests.
17. Detect objectifying companion language.
18. Detect fake urgency or instant-booking pressure.
19. Detect off-platform contact/payment pressure.
20. Detect prompt injection or hidden-rule probing.
21. Detect requests for internal matching logic.
22. Build hidden structured signals.
23. Choose role-aware retrieval scope.
24. Retrieve relevant product/corpus context.
25. Score retrieval confidence.
26. Drop weak or irrelevant context.
27. Separate product facts from private inference.
28. Resolve next stage.
29. Select Muse voice mode.
30. Select safe level of detail.
31. Draft one concise response.
32. Prefer one useful next question or action.
33. Remove source-title/RAG/context references.
34. Remove model self-reference.
35. Remove hidden inference terms.
36. Remove astrology/matching-engine language.
37. Remove red-light/objectifying/payment-pressure copy.
38. Normalize Muse voice: private, warm, witty, practical.
39. Check no policy narration leaked.
40. Check no excessive certainty.
41. Check route/next action correctness.
42. Attach private quality metadata.
43. Capture pain-point candidates.
44. Queue prompt/corpus/eval improvement candidates.
45. Return the user-facing reply and structured contract.

## User-Facing Rule

Muse can use private inference internally, but must translate it into timing, rhythm, privacy, boundaries, comfort, temperament, pull, and fit.
