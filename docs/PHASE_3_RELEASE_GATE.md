# Phase 3 — CI and security release gate

Status: **IMPLEMENTATION CONTINUES ON MAIN; NOT APPROVED FOR PRODUCTION**

## Implemented on this branch
- Updated frontend and core-policy GitHub Actions to run on main, rebuild branch and Phase 3 branch. Added backend TypeScript workflow.
- Excluded environment secrets from compiled server artifacts.
- Required JWT signing configuration and successful database connection before starting HTTP listener.
- Restricted reading private curriculum sections to enrolled students, instructors and admins.
- Prevented clients from reassigning lessons and sections across courses.
- Required complete, valid quiz-answer arrays before grading.
- Blocked unpublished and unverified paid enrollment requests and approvals; membership writes use idempotent updates. **Multi-document enrollment approvals now use MongoDB transactions; replica-set integration and concurrency tests remain outstanding.**
- Blocked enrollment into drafts through direct course enrollment; hid draft listings and rosters on public instructor routes.
- Removed legacy login debug statements; hid reset-token metadata; strengthened password input checks and cleared the session cookie on sign-out.
- Limited quiz attempts and removed internal per-question grading details from student progress and quiz responses.
- Introduced persistent server-issued exam sessions, immutable deadlines, complete-answer validation and limited exam attempts. Browser-submitted timestamps are no longer authoritative.
- Updated classroom countdown and completion flows to use assessment-specific server responses.
- Added a pure assessment policy module with nine locally verified unit tests, now invoked by quiz/exam endpoints. The backend CI workflow includes those tests.

## Follow-up: transactional enrollment and JWT revocation (November 10, 2026)

- Enrollment approvals now use a MongoDB transaction to atomically update the approval request, course, user and progress; notification is sent only after commit.
- An isolated single-node MongoDB replica set is required for local approval testing. Standalone servers fail closed.
- JWTs carry a per-account session version; logout, password/role changes and password resets invalidate previous tokens for that account.
- Existing JWTs issued before the session-version change must sign in again.
- Eight isolated session-version unit tests passed locally with Node.js 22 and TypeScript 5.8.3, and are included in `server/npm run test:policy`.
- **Not yet verified:** MongoDB transaction integration/concurrency, complete backend/frontend builds, cross-device logout, CSRF mitigations, individual device revocation or browser E2E coverage.

## Hosting decision and local development

- **Vercel has been discontinued by the project owner.** No replacement host has been selected, and choosing one is explicitly deferred.
- The current application remains a Next.js frontend, Express API and MongoDB development stack. Local URLs and secrets are configured through `client/.env.example` and `server/.env.example`.
- Old Vercel metadata, deployment config and environment exporter were removed from the active branch.
- Legacy seed, database troubleshooting and bulk password-reset scripts containing credentials or unsafe defaults were retired. Use `npm run doctor` to validate local API configuration without displaying secrets.
- **Urgent:** old public Git history contains database credentials. Rotate/revoke database access outside GitHub; deleting tracked files does not invalidate those credentials.
- Express now exposes host-independent liveness (`GET /api/v1/health/live`) and MongoDB readiness (`GET /api/v1/health/ready`), with limited JSON request size and secure HTTP headers.
- Educator/student detail and enrollment listings now check actual course membership before returning learner PII.
- GitHub Actions checks are a separate engineering concern from Vercel hosting. Their failing runs still require investigation; a discontinued Vercel deployment alone does not prove the cause.

## CI blocker
At the 2026-11-09 checkpoint, new workflow runs fail with no recorded job steps. GitHub returns 404 BlobNotFound for job logs. These reports do not show a completed lint, TypeScript, frontend build or backend test. Inspect GitHub repository Settings → Actions, runner availability, quotas/billing and workflow configuration first.

## Validate before merge
1. `cd client && npm ci && npm run typecheck && npm run lint && npm run build`
2. `cd packages/core && npm ci && npm test`
3. `cd server && npm ci && npm run test:policy && npx tsc --noEmit && npm test -- --passWithNoTests && npm run build`
4. Confirm the application refuses startup with missing database or signing key.
5. Perform student / educator / admin E2E tests with an isolated database.
6. Verify no private drafts or correct answers appear in public or unauthorized API responses.
7. Verify course section and lesson ownership, quiz submissions, and authorized PDF certificate downloads.
8. Audit deployment artifact for secret files and restore procedures.

## Remaining release blockers
- Temporary account-level JWT revocation is implemented; browser localStorage tokens still need replacement with per-device, revocable HttpOnly sessions.
- Password recovery is on security hold pending safe outbound email support.
- Subscription billing, tenant isolation and audit logging are incomplete.
- Request schema validation and anti-abuse controls need full review. Transactional enrollment has been implemented but requires live database rollback/concurrency validation.
- Exam sessions are persisted in MongoDB, but concurrent submission races require integration testing and an atomic attempt-claim operation.
- Draft-to-published course transitions and enrollment reconciliation must be exercised against an isolated test database.
- The nine isolated assessment-policy unit tests passed locally using Node.js 22 and TypeScript 5.8.3; this does **not** mean server, frontend, GitHub Actions or browser tests passed.
- No browser-verified staged application or passing CI exists yet.

Do not deploy or release the current main branch until full builds, integration tests and a security review have passed.
