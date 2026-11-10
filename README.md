# iremehub+

**One platform. Better learning. Smarter institutions.**

[![Status: Pre-release](https://img.shields.io/badge/status-pre--release-orange)](#project-status)

iremehub+ is the planned commercial successor of [iremeHub LMS](https://github.com/moiseiyaa/iremeHub-lms): a multi-tenant, mobile-friendly learning platform for schools, universities, training providers, and corporate academies.

> **Important:** This branch is a **rebuild in progress**, not a production-ready SaaS application. The existing `client/` and `server/` remain a legacy Next.js/Express/MongoDB prototype. Do not sell, deploy to students, or process real payments using this repository without completing the security, product and operational release gates.

## Project status

| Component | Today | Target |
| --- | --- | --- |
| Legacy frontend | Next.js 15, React 19, some mock/dashboard flows | Accessible, mobile-first institutional UX |
| Legacy backend | Express 4, MongoDB/Mongoose, global roles | Modular application services, tenant-aware API |
| Authentication | Legacy token flow; unsafe bypasses removed on rebuild branch | Secure server sessions, MFA, recovery |
| Organization isolation | Domain policy created but not wired to existing routes | Membership and database-backed tenancy |
| Learning | Existing course, lesson, progress, grading and certificate concepts | Fully tested instructional workflows |
| Billing | Legacy placeholders, not a working purchase system | Provider-verified payments and subscriptions |
| Data schema | Proposed PostgreSQL migration, not applied | Deployed, tested, tenant-safe relational models |
| Test / CI | 9 policy unit tests passed locally; GitHub Actions failed before steps were available | Full reproducible CI and end-to-end coverage |

## Commercial positioning

**Primary model:** B2B hosted subscriptions to schools, independent training institutes and corporate L&D teams. Each organization receives its own workspace, membership controls, courses, content, progress, analytics and billing.

**Secondary models (later):** white-label setup fees, managed onboarding/training, enterprise licensing and integration services. A public marketplace is out of scope for the first institutional release.

Pricing, market demand, gross margin and customer acquisition costs are **hypotheses requiring research and pilot evidence**, not established business results. See [Buyer readiness](docs/BUYER_READINESS.md).

## Technical direction

- **Web:** Next.js and TypeScript, using the committed iremehub+ responsive design system; remaining browser/accessibility checks are not complete.
- **Services:** Modular NestJS or equivalent typed service boundary; versioned REST/OpenAPI, strict validation and server-side authorization.
- **Data:** PostgreSQL, migrations, organization-scoped relationships, row-level security evaluation and auditable billing transactions.
- **Operations:** Background jobs, object storage, secure secrets management, structured logs, error tracking, performance budgets, backups and recovery drills.
- **Payments:** Rwanda-compatible, contractually verified providers with signed webhooks, idempotent event handling and entitlement reconciliation.

These are architecture decisions under evaluation. **No implied deployment** of NestJS, PostgreSQL, Redis or payment providers.

## Repository overview

```text
client/                 Legacy Next.js frontend (migration reference)
server/                 Legacy Express/MongoDB backend (migration reference)
packages/core/          Tested organization-scoped authorization policy
apps/api/db/migrations/ Proposed PostgreSQL domain migration (not applied)
docs/                   Rebuild roadmap, ADRs, progress and buyer documentation
.github/workflows/      Isolated core checks (remote CI currently unresolved)
```

### Policy module quick start

Use Node.js 22+:

```bash
cd packages/core
npm ci
npm test
```

This compiles the pure TypeScript authorization module and runs nine Node.js tests. A successful unit test does not demonstrate that the original Express backend enforces organization boundaries.

### Current pre-release application

The pre-release application has separate install/run instructions under `client/` and `server/`, with MongoDB and application secrets configured through environment variables. A hosting provider has **not been selected**. See [host-independent local development](docs/HOST_INDEPENDENT_DEVELOPMENT.md). Do not use the documented demo credentials; they may be exposed in repository history. All real exposed credentials must be rotated.

### Database proposal

The initial SQL migration is at [apps/api/db/migrations/0001_tenant_foundation.sql](apps/api/db/migrations/0001_tenant_foundation.sql). It defines organizations, memberships, courses, enrollments, entitlements, subscriptions and payment event deduplication. It is **not yet executed** and does not itself enforce end-to-end tenant isolation.

Read [the migration safety guide](apps/api/db/README.md) before provisioning a development PostgreSQL database.

## Security and engineering gates

1. Eliminate all hardcoded/demo authentication behavior and expose no reset tokens.
2. Replace browser-accessible authentication tokens with secure and revocable sessions.
3. Require explicit organization-scoped authorization on every server handler and query.
4. Validate and limit user input, file uploads, media and API access.
5. Do not grant paid learning access from browser callbacks or unverified payment records.
6. Make builds fail on TypeScript, ESLint, tests or security regressions.
7. Back up data, verify restoration, monitor production and document incident response.
8. Complete security review, accessibility audit, load tests, data protection assessment and paid customer pilots before commercial launch.

**CI note:** As of 2026-11-09, GitHub Actions reports failed core workflow runs without step-level logs. The root cause is not yet determined. Review [GitHub Actions](https://github.com/moiseiyaa/iremeHub-lms/actions) and correct the runner/workflow issue before merging.

## Version control and recovery

- `main`: baseline containing the 53 ordered iremehub+ renovation commits.
- `fix/phase-3-ci-and-security`: additional reviewed pre-release hardening commits, staged in draft PR #2.
- Commit each coherent milestone and review it before merging. Use release tags, backups and rollback plans before a future production release.
- Removing generated dependencies from the latest tree does not remove old Git history or credentials.

## Buyer and investor diligence

The repository is publicly distributed under [Apache License 2.0](LICENSE). This permits commercial use under its terms, but it does **not** establish exclusive ownership of old copies, third-party media or software dependencies. Before licensing or selling the business, verify intellectual-property ownership, contributor rights, data protection obligations, trademarks, operational costs, cybersecurity evidence, customer contracts and documented revenue.

For documents and milestones, see [rebuild roadmap](docs/REBUILD_ROADMAP.md), [architecture ADRs](docs/adr), and [buyer readiness](docs/BUYER_READINESS.md).

## License

Current legacy repository: Apache License 2.0. A future commercial service agreement or enterprise license should be reviewed separately by qualified counsel. Pricing and commercial rights remain subject to validation.
