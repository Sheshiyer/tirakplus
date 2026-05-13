# Evidence for TP-CUST-028: Session Endpoint Contract

## Contract Proof
- `src/app/api/session.ts` provides fetch-backed services for login, verification, session retrieval, role switch, and logout.
- `AuthContext.tsx` wraps the session logic in a React Context Provider.
- `src/worker/auth.ts` implements `/api/auth/start`, `/api/auth/verify`, `/api/session`, `/api/session/role`, and `/api/auth/logout`.
- HTTP probes verified cookie-backed session creation, active session retrieval, role switching, logout, and anonymous state after logout.

## Anti-Pattern Checklist Evidence
- [x] No auth mock data is hardcoded inside UI components.
- [x] Staged data is delivered through Worker API envelopes with request IDs.
- [x] No browser-visible fake token is returned from verification.
