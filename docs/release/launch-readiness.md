# Launch Readiness Checklist

- [ ] CI is green on the launch branch.
- [ ] `npm run quality:release` passes.
- [ ] `npm run contract:smoke` passes against the target Worker.
- [ ] Privacy, terms, cookies, support, safety, and payment pages have approved copy.
- [ ] Auth is production-grade or launch is explicitly staged-only.
- [ ] Session storage uses an approved server-side store.
- [ ] Rate limits and CSRF are enabled for state-changing routes.
- [ ] Payment gate remains disabled until compliance approval.
- [ ] Muse RAG copy audit passes.
- [ ] Asset provenance is reviewed for cross-project leakage.
- [ ] Admin dashboard review workflow is connected or launch scope excludes live review.
- [ ] Custom domain and Cloudflare routing are verified.
