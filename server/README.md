# iremehub+ — API

Express 4, TypeScript and MongoDB/Mongoose backend for the ongoing iremehub+ learning platform.

**No hosting provider is required for development.** Run locally with an isolated development database. Never copy production credentials into this public repository.

## Start locally

Requires Node.js 22+ and a local or development-only MongoDB **replica set** for transactional enrollment approvals. See [MongoDB setup](../docs/HOST_INDEPENDENT_DEVELOPMENT.md#mongodb-transaction-requirement-for-enrollment-approvals).

```bash
cp .env.example .env
npm ci
npm run doctor
npm run dev
```

The `doctor` command checks configuration shape without opening a database connection or printing secrets. The server itself refuses to listen if its JWT signing key or database connection is unavailable.

Default API base: http://localhost:5000/api/v1

## Development checks

```bash
npm run test:policy
npx tsc --noEmit
npm test -- --passWithNoTests
npm run build
```

Legacy credential-bearing scripts and demo account-reset tools were removed. See [the security cleanup record](../docs/LEGACY_DEMO_SCRIPTS_REMOVED.md). Rotate any real credentials exposed in previous Git commits.

## Status and next work

The code includes authentication, courses, lessons, assessments, educator workflows, enrollment approvals and certificates; they are **not all integration-tested**. Production readiness additionally requires tenant isolation, per-device secure sessions, **integration tests for transactional enrollment**, rate limiting, observability, backup recovery and verified payment/entitlement processing.

See [release gate](../docs/PHASE_3_RELEASE_GATE.md) and [development instructions](../docs/HOST_INDEPENDENT_DEVELOPMENT.md).
