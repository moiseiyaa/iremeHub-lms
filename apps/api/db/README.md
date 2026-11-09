# Phase 2 — Tenant-aware PostgreSQL foundation

**Status:** proposed schema; migration has NOT been applied or integration-tested.

File: `apps/api/db/migrations/0001_tenant_foundation.sql`.

## Design guarantees from the database
- A user can have one membership per organization, with a role and lifecycle status.
- Courses, enrollments, entitlements and payment references carry organization ownership.
- Composite foreign keys prevent an enrollment from linking a learner to a course in a different organization.
- One active enrollment record and one current entitlement state per learner/course/organization; event history is separate.
- Payment and subscription provider identifiers have uniqueness constraints supporting idempotency and reconciliation.
- All monetary values are integers in minor currency units; currency is explicit.

## Important limits
- Composite foreign keys alone do NOT enforce tenant confidentiality. Implement tenant-safe query filters and security policy checks server-side; consider PostgreSQL RLS with a restricted database role before production.
- Do not trust `organization_id`, role or payment state supplied by the browser. Resolve tenancy from authenticated membership and verify provider-signed payment events.
- The migration is additive foundation code, not a completed NestJS service or a replacement for legacy MongoDB models.
- No migrations were run against customer data. Do not point this script at production without a snapshot, dry run, migration review and rollback plan.
- `platform_users.password_hash` is transitional. Session design, MFA, recovery and account deletion need separate security decisions.
- Decide on a canonical migration engine (Prisma/SQL) before creating migrations 0002+. Avoid running both ORM-generated and manual migrations on the same schema.

## How to validate in development
1. Provision isolated PostgreSQL 15+ with least-privileged migration credentials.
2. Run the SQL via `psql -v ON_ERROR_STOP=1 -f apps/api/db/migrations/0001_tenant_foundation.sql` against an EMPTY development database.
3. Insert two organizations, two memberships, courses and enrollments.
4. Assert that inserting a cross-organization enrollment fails due to the composite FK.
5. Verify unique membership, enrollment and payment-event keys and status check constraints.
6. Write migration idempotency/rollback policy and automated integration tests before deploying.
