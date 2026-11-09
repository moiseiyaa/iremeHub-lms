# ADR-0002 — PostgreSQL tenant-aware domain schema

**Date:** 2026-11-09
**Status:** Proposed; schema committed for review, migration not applied.

## Context
The legacy LMS models student/course relationships in MongoDB, including duplicated enrollment arrays. Commercial SaaS requires explicit organizations, transactional money records, membership-based roles and trustworthy enrollment entitlements.

## Decision
Prototype a PostgreSQL relational foundation with composite organization-scoped keys, referential integrity, a separate payment event inbox, and explicit amount/currency fields.

## Alternatives
Retaining MongoDB would reduce migration cost but requires equivalent tenant filters, consistency controls and payment reconciliation. PostgreSQL provides explicit FK constraints and transaction semantics suited to tenant ownership and billing.

## Unresolved
Session persistence, row-level security model, final migration tool, historical data migration, provider adapters, audit ledger and privacy deletion requirements all need further decisions and tests.
