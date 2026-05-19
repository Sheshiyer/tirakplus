# TP-CUST-140 Evidence: Customer Quickstart Smoke Test

- `npm run check` passed.
- `npm run contract:smoke` passed 26 checks against `http://127.0.0.1:8787`.
- Targeted probes passed for `/api/public/home` and `/api/muse/chat`, including request ID propagation and security headers.
- Browser MCP opened `/` and `/overview` with zero warnings/errors.
- Chrome headless produced mobile, tablet, and desktop public screenshots for review.
