# ADR-0001 — Modular monolith and organization-scoped permissions

**Date:** 2026-11-09
**Status:** Accepted for a pure authorization-policy prototype; backend integration pending.

## Context
The original application uses one global role per user (`student`, `educator`, `admin`) and lacks an organization boundary. Commercial customers need dedicated workspaces; a person may be a teacher in one institution and a learner in another.

## Decision
- Organize permissions around an organization ID, membership record, and role.
- Permit multiple independently authorized memberships per user.
- Use `packages/core` to express dependency-free permission decisions.
- Return denial when membership is inactive, duplicated, inconsistent, cross-organization, or absent.
- Require ownership checks when educators edit, publish, assess or manage enrollment in a course.
- Require a specific, active, server-validated course entitlement for learner access.
- No implicit super-administrator bypass; future platform-administration operations need separately audited privileges.
- Keep auth and persistence outside the policy module. API services must load scope and membership from trusted storage; client claims are untrusted.

## Consequences
The policy code alone does not authenticate requests or protect the legacy endpoints. Integration requires a new tenant-aware database schema, secure sessions, guards, and cross-tenant API integration tests.

## Follow-up decisions
- ADR-0002: Relational schema, constraints and tenant isolation.
- ADR-0003: Session lifecycle, MFA and password recovery.
- ADR-0004: Billing ledger, idempotent webhooks, entitlements and reconciliation.
