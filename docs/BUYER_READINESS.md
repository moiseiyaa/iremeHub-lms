# iremehub+ — Buyer & investor readiness

**Version:** 0.1; **Status:** pre-commercial, draft for diligence (2026-11-09).

## Product investment thesis
iremehub+ aims to sell managed learning environments to institutions that need course authoring, cohort administration, assessments, progress analytics, certificates and local payment compatibility. Repeatable hosted subscriptions are the lead monetization model; managed onboarding and white-label customization are secondary service revenue opportunities.

## Target buyer profiles
1. Private schools or vocational training centers needing digital coursework.
2. Training companies monetizing professional programs.
3. Corporate HR and talent teams managing staff training.

## Revenue hypotheses (not historical revenue)
- Subscription tiers based on active learners, storage, administrators and service level.
- Set-up and migration fees to cover institution onboarding.
- Optional branding, support, integration and annual licensing.
- Local payments subject to provider availability, fees, settlement rules, taxation and required legal approvals.

## Diligence to complete before a sale
- **Product:** validated customer personas, retained pilots, roadmap and full working demo.
- **Security:** vulnerability remediation, penetration-test summary, tenant isolation, backup drills, incident management.
- **Technology:** architecture diagrams, OpenAPI contracts, data model, API ownership, automated CI, monitoring dashboards, support/SLA model.
- **Commercial:** price tests, signed pilots, pipeline, recurring revenue and churn only once actually measured.
- **Legal:** Apache-2.0 compliance, contributor rights, trademark search, customer terms, privacy policies, data processing agreements and regulator-facing obligations.
- **Operations:** infrastructure invoices, cost per active student, renewal process, payment reconciliation and support capacity.

## Current reality versus planned capability
The codebase already has a legacy LMS prototype. The current rebuild branch contains security containment, a tested pure authorization policy and a proposed relational schema. **No verified production SaaS deployment, paying customer contracts, payment integration or recurring revenue is represented by these artifacts.**

## Phase gates
- **P0:** security containment and source hygiene — code pushed, integration tests pending.
- **P1:** authorization policy and local unit tests — code pushed, remote CI still failing.
- **P2:** database proposal — code pushed but not migrated or wired to backend.
- **P3:** usable learner/educator/institution application — pending.
- **P4:** billing, subscriptions and entitlements — pending.
- **P5:** production security, performance and operations, first paid pilots — pending.

## Buyer deliverables at launch
README, architectural decisions, API docs, release notes, infrastructure overview, access/roles matrix, data retention policy, disaster recovery runbook, commercial financial model based on actual numbers, licensing/IP schedule and support operations.
