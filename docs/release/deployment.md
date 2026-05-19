# Deployment Notes

## Environments

- Preview: every pull request should run CI and deploy through Cloudflare preview once the domain workflow is configured.
- Staging: connects to staging Worker secrets, staging KV, and staged Muse RAG configuration.
- Production: uses production secrets, approved custom domain routing, and compliance-cleared payment/provider settings.

## Cloudflare Checklist

- Confirm `wrangler.jsonc` Worker name and compatibility date.
- Add explicit routes or custom domain mapping for `tirakplus.com`.
- Keep `tirakplus-muse-rag` separate from other project Workers.

## Vercel Web Shell

The Vercel project serves the Vite web shell from `dist` and keeps browser traffic same-origin by rewriting `/api/*` to the Cloudflare customer Worker:

- Vercel app routes: static assets and SPA deep links.
- API origin: `https://tirakplus.tirak-court.workers.dev/api/*`.
- Muse RAG remains isolated behind the Cloudflare customer Worker service binding.

When the production domain is moved to Vercel, the browser should continue calling relative `/api/*` routes. Vercel rewrites those calls server-side, so the browser does not need cross-origin API access.
- Store `NVIDIA_API_KEY`, `MUSE_AGENT_API_KEY`, and related secrets per Worker.
- Verify service binding from customer Worker to Muse RAG before production deploy.

## Release Command

Use `npm run quality:release` before deployment. Run `npm run contract:smoke` against a local or staging Worker before tagging a launch candidate.
