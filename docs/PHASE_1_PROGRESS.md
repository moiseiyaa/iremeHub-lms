# iremehub+ — Phase 1 foundation progress

## Delivered
- Pure, typed authorization policy in `packages/core`.
- Test suite covering cross-tenant access, ownership, role boundaries, inactive members and paid-course entitlement decisions.
- A narrowly scoped GitHub Actions workflow, compiling and testing `packages/core`.
- ADR-0001, documenting authorization assumptions and non-goals.

## Explicitly not delivered
- Tenant or membership persistence and any database migrations.
- Wiring the policy into the current Express routes.
- Production-grade authentication, billing, UI redesign or integrated deployment.
- Security certification or verified passing legacy test suite.

## Verification guide
Run `cd packages/core && npm install && npm test`.
Review workflow runs in GitHub Actions. A passing policy unit test does not establish API authorization until the policy is integrated into request handlers and backed by trusted membership data.

## Next engineering gates
1. Commit and verify a lockfile and switch CI to `npm ci`.
2. Implement `Organization`, `Membership`, `Course`, `Enrollment`, `Entitlement` persistence and tenant-safe queries.
3. Add server-side auth context resolution, session handling and cross-tenant API tests.
4. Clean legacy client mock-auth paths and remove build-error suppression.
