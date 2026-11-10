# Account security — continued development checkpoint

**Date:** 2026-11-10  
**Branch:** `main` (host-independent development).  
**Status:** In progress, **not production-approved**.

## Implemented in this round

1. Bounded, fixed-window in-memory rate policy and API middleware:
   - Login: per-network and hashed normalized-email buckets.
   - Registration, password recovery, and token refresh: independently bounded buckets.
   - Responses return HTTP 429 and `Retry-After`; never include account existence details.
2. Registration and password-validation policy:
   - Name and email input types, lengths, and normalization checked before MongoDB.
   - New passwords must be at least 8 characters and no more than 72 UTF-8 bytes, avoiding bcrypt's silent 72-byte truncation.
   - User email schema now normalizes email and allows common valid addresses such as `name+tag@example.com`.
   - Client signup validation and login email normalization agree with the backend.
3. Cookie-authenticated API mutations now require a matching `Origin` header:
   - `FRONTEND_URL` must match the actual browser origin (including scheme and nondefault port).
   - Authorization via explicit Bearer tokens remains supported while the frontend migrates.
   - This protects cookie-only requests, but is **not** a complete replacement for CSRF tokens in all deployment architectures.
4. 24 isolated tests for the newly added rate counter, registration, and cookie-origin policies passed locally with Node.js and TypeScript. Existing tests and full application builds were **not** rerun in this session.

## Run locally

```bash
cd server
npm ci
npm run test:policy
npx tsc --noEmit
npm run build
```

```bash
cd client
npm ci
npm run typecheck
npm run lint
npm run build
```

Do not use real user data for manual tests.

## Outstanding security and release gates

- **Replace localStorage bearer JWTs.** The current browser still stores tokens in JavaScript-accessible storage. Move entirely to secure, revocable HttpOnly cookie sessions with CSRF protection and clear login/logout/expiry UX.
- **Use a distributed rate-limit service** for multi-instance deployments. This in-memory protection is per process; when a Next.js proxy is used, backend `req.ip` may identify the proxy rather than the end user. Avoid trusting client-supplied forwarding headers.
- Introduce a safe email-delivered password reset flow; the current forgot-password endpoint intentionally remains on hold.
- Add integration and concurrency tests to transaction-backed enrollment, assessments, permissions and role changes.
- Reconcile existing emails before enforcing new canonical lowercase values if migrating real user data (no migration has been run).
- Validate all role-based UI journeys, CSRF origin behavior, browser/device accessibility and logout revocation.
- **Rotate previously exposed database credentials.** Removing them from the tracked files did not erase historical Git commits.
- GitHub Actions workflows currently fail without useful step logs, so no successful end-to-end CI or deployable build has been verified.
- No hosting provider has been selected, and no deployment is being made.

**Do not infer production readiness merely because development commits are on `main`.**
