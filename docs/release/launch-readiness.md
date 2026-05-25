# Launch Readiness Checklist

- [ ] CI is green on the launch branch.
- [x] `npm run quality:release` passes.
- [x] `npm run contract:smoke` passes against the target Worker.
- [ ] Privacy, terms, cookies, support, safety, and payment pages have approved copy.
- [ ] Auth is production-grade or launch is explicitly staged-only.
- [ ] Session storage uses an approved server-side store.
- [ ] Rate limits and CSRF are enabled for state-changing routes.
- [ ] Runtime app smoke verifies CSP/security headers on public navigation routes.
- [ ] Payment gate remains disabled until compliance approval.
- [ ] Muse RAG copy audit passes.
- [ ] Asset provenance is reviewed for cross-project leakage.
- [ ] Admin dashboard review workflow is connected or launch scope excludes live review.
- [ ] Custom domain and Cloudflare routing are verified.

## 2026-05-25 UI Repair Candidate

Local release candidate details are recorded in `docs/release/ui-repair-closeout-20260525.md`.

- Commit: `7c61a24 Harden Tirak Plus product readiness`
- Local Worker preview: `http://127.0.0.1:8787`
- Passed: `npm run quality:release`, `npm run contract:smoke`, `npm run stripe:smoke`, `npm run app:smoke`
- Remaining launch gates: production preview URL, custom domain, live Muse service binding, payment compliance approval.
