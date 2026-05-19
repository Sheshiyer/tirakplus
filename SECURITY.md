# Security Policy

## Supported Surface

Tirak Plus is currently a staged responsive web app backed by Cloudflare Workers. Production launch requires review of session storage, data retention, provider supportability, admin review workflows, and jurisdiction-specific operating rules.

## Reporting

Send security and privacy concerns to `support@tirakplus.com` until a dedicated security inbox is approved.

## Current Guardrails

- API responses use request IDs and security headers.
- Payment state remains behind the documented compliance gate.
- Muse-visible copy must not expose internal inference terms or brand Muse as an AI product label.
- Secrets must be stored through Cloudflare secrets/KV and never committed.

## Production Blockers

- Replace staged verification code auth with a production provider.
- Replace JSON session cookies with signed opaque session IDs backed by server-side storage.
- Add CSRF protection for state-changing routes.
- Add rate limits for auth, Muse chat, inquiries, reports, and account changes.
- Add D1/R2 migrations and retention/delete/export workflows.
