# TP-CUST-053 Evidence: Public API Home Endpoint

- `npm run contract:smoke` passed the public home check against `http://127.0.0.1:8787/api/public/home`.
- Targeted probe returned HTTP 200 with `data`, four city entries, and a request ID.
- Response headers now include `Cache-Control: no-store`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, and `X-Request-Id`.
- Anti-pattern check: public data is served through API-shaped rails, not hardcoded component arrays.
