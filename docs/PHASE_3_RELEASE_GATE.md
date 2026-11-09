# Phase 3 — CI and security release gate

Status: **IN PROGRESS; NOT APPROVED FOR PRODUCTION**

## Implemented on this branch
- Updated frontend and core-policy GitHub Actions to run on main, rebuild branch and Phase 3 branch. Added backend TypeScript workflow.
- Excluded environment secrets from compiled server artifacts.
- Required JWT signing configuration and successful database connection before starting HTTP listener.
- Restricted reading private curriculum sections to enrolled students, instructors and admins.
- Prevented clients from reassigning lessons and sections across courses.
- Required complete, valid quiz-answer arrays before grading.
- Blocked unpublished and unverified paid enrollment requests and approvals; membership writes use idempotent updates. **Multi-document transactions remain outstanding.**
- Blocked enrollment into drafts through direct course enrollment; hid draft listings and rosters on public instructor routes.
- Removed legacy login debug statements; hid reset-token metadata; strengthened password input checks and cleared the session cookie on sign-out.
- Limited quiz attempts and removed internal per-question grading details from student progress and quiz responses.
- Introduced persistent server-issued exam sessions, immutable deadlines, complete-answer validation and limited exam attempts. Browser-submitted timestamps are no longer authoritative.
- Updated classroom countdown and completion flows to use assessment-specific server responses.
- Added a pure assessment policy module with nine locally verified unit tests, now invoked by quiz/exam endpoints. The backend CI workflow includes those tests.

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
- Browser localStorage tokens need replacement with revocable secure sessions.
- Password recovery is on security hold pending safe outbound email support.
- Subscription billing, tenant isolation and audit logging are incomplete.
- Request schema validation, anti-abuse controls and transaction consistency need full review.
- Exam sessions are persisted in MongoDB, but concurrent submission races require integration testing and an atomic attempt-claim operation.
- Draft-to-published course transitions and enrollment reconciliation must be exercised against an isolated test database.
- The nine isolated assessment-policy unit tests passed locally using Node.js 22 and TypeScript 5.8.3; this does **not** mean server, frontend, GitHub Actions or browser tests passed.
- No browser-verified staged application or passing CI exists yet.

Do not merge this branch into main or deploy it until validation and review have passed.
