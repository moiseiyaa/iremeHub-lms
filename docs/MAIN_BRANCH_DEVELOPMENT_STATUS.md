# iremehub+ development status — 10 November 2026

## Branch management

The project owner explicitly requested that the Phase 3 changes be pushed to `main`, preserving the commit history. The application remains **pre-release and not deployed**.

- Prior baseline: `b02936417eae85350fe5ee70a551de42ad4c4adf` (53-commit iremehub+ frontend renovation)
- Phase 3: hosting independence, safety fixes, backend assessment validation, access-control changes, CI workflows and documentation
- Hosting provider: **not selected**; Vercel files have been removed. Development uses local Next.js, Express and MongoDB.
- Code pushed to `main` is not an assertion of successful staging validation or suitability for production.

## Additional safeguards

- Disabled the old direct enrollment endpoint until the educator-approval process and verified billing entitlements can be reconciled safely. The current course page uses `/request-enroll`.
- Limited learner access to published course lessons, and allowed unauthenticated preview-style access only for lessons marked preview in published courses (endpoint itself still requires login).
- Created shared pure policy functions for lesson access and free-course approval, wired into the backend.
- **15 new access-policy tests were compiled and passed locally** with Node.js 22 and TypeScript 5.8.3. Alongside nine prior isolated assessment-policy tests, the backend test script now executes both groups.

## Outstanding release gates

1. GitHub Actions reports failed frontend, backend and core workflows with no usable steps/logs. These are **not** verified passing builds.
2. Run frontend typecheck, ESLint, production bundle and browser/device QA.
3. Run backend TypeScript compile, unit tests, integration tests against an isolated MongoDB replica set, race tests and certificate verification.
4. Secure and revoke legacy browser JWT sessions and implement safe password recovery and CSRF defenses.
5. Complete tenant isolation, subscription billing, payment reconciliation and operational observability.
6. Transactional enrollment reconciliation and assessment attempt locking remain outstanding.
7. **Urgent manual action:** rotate/revoke any real MongoDB credentials previously committed to public Git history; removing active files does not revoke exposure.
8. Select hosting later, after requirements, data-protection safeguards, cost and regional latency are evaluated.

## Locally executable commands

```bash
cd server && npm ci && npm run test:policy && npx tsc --noEmit && npm run build
cd ../client && npm ci && npm run typecheck && npm run lint && npm run build
cd ../packages/core && npm ci && npm test
```

Do not deploy, enable real payments or treat private student data as production-test fixtures until these gates are verified.
