# iremehub+ — Product rebuild roadmap

> Pre-release. This document describes planned engineering work, not deployed functionality.

## Product direction
Rebuild the single-organization legacy LMS into a subscription-based, multi-tenant B2B platform serving schools, training centers and enterprise learning teams. Preserve `main` as an unmodified historical reference. Develop in `rebuild/iremehub-plus`.

## Ordered milestones
- **Phase 0: Containment.** Remove unsafe authentication fallbacks, disable reset-token disclosure, restrict public course data, clean generated dependencies from version control, and document credential response.
- **Phase 1: Engineering foundation.** Tenant-scoped authorization policy, policy tests, isolated CI, branch/commit conventions, architecture decisions.
- **Phase 2: Data and service foundation.** Tenant-aware schema, migrations, secure sessions, database-backed membership resolution, API authorization and cross-tenant integration tests.
- **Phase 3: Learning product.** Accessible learner UX, educator authoring, assessments, submissions, progress, certificates and institutional reporting.
- **Phase 4: Business engine.** Organization plans, verified payments, invoices, metering, subscription state, idempotent entitlements and support operations.
- **Phase 5: Production readiness.** Security review, dependency audits, backups with recovery tests, observability, load/accessibility testing, pilots and commercial due diligence.

## Technical principles
1. Every tenant-owned record and query is scoped to an organization determined from trusted authentication and membership context.
2. Authorization is enforced on the server, regardless of visible client navigation.
3. Secret material never appears in source, logs, unauthenticated responses or published artifacts.
4. Payment may grant course access only after verified provider events, not browser redirects.
5. Security fixes and business features are committed in separately reviewable changes.
6. No production build may bypass TypeScript or lint errors.
7. Maintained dependencies are selected after compatibility and security assessment.

## Definition of production-ready
- No critical or high unresolved authentication and tenant-isolation vulnerabilities.
- Reliable email verification and recovery; secure, revocable sessions.
- CI with reproducible installs, typechecking, tests, lint and dependency/secret scanning.
- Functional organization onboarding and subscription-to-payment journeys.
- Documented privacy, incident response, retention, licensing and operational runbooks.
- Monitoring, backups, tested restores, deployment rollback and measurable service targets.

## Immediate risk notes
Legacy Git history may contain demonstration credentials or generated artifacts. Removing tracked files now does not erase history. Rotate any live exposed secrets, review history and audit deployed environments before exposing the legacy system.
