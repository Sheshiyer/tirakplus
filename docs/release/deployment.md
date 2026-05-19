# Deployment Notes

## Environments

- Preview: every pull request should run CI and deploy through Cloudflare preview once the domain workflow is configured.
- Staging: connects to staging Worker secrets, staging KV, and staged Muse RAG configuration.
- Production: uses production secrets, approved custom domain routing, and compliance-cleared payment/provider settings.

## Cloudflare Checklist

- Confirm `wrangler.jsonc` Worker name and compatibility date.
- Add explicit routes or custom domain mapping for `tirakplus.com`.
- Keep `tirakplus-muse-rag` separate from other project Workers.
- Store `NVIDIA_API_KEY`, `MUSE_AGENT_API_KEY`, and related secrets per Worker.
- Verify service binding from customer Worker to Muse RAG before production deploy.

## Release Command

Use `npm run quality:release` before deployment. Run `npm run contract:smoke` against a local or staging Worker before tagging a launch candidate.
