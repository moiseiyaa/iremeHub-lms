# Hosting-independent development

**Decision:** Hosting/deployment provider is intentionally **undecided**. No Vercel account, project, CLI or deployment integration is required to develop iremehub+.

## Current development stack
- Frontend: Next.js / React / TypeScript in `client/`.
- Backend: Express / TypeScript in `server/`.
- Database: MongoDB for the current prototype; the proposed PostgreSQL tenancy schema is *not yet applied*.
- The frontend calls its own origin at `/api/v1/*`; Next.js rewrites these requests to `API_PROXY_TARGET` (default `http://localhost:5000`). The frontend does not require a public backend URL at build time.

## Local developer workflow
Use Node.js 22 or later. With a **local, throwaway** MongoDB database and newly generated credentials:

```bash
cd server
cp .env.example .env
npm ci
npm run dev
```

In a separate terminal:

```bash
cd client
cp .env.example .env.local
npm ci
npm run dev
```

Visit `http://localhost:3000`. Never commit `.env` or `.env.local`. Do not use production data or paid users during this pre-release development stage.

## MongoDB transaction requirement for enrollment approvals

Enrollment approvals now commit the request decision, course membership, student membership and progress inside **one MongoDB transaction**. This requires a MongoDB replica set (a single-node replica set is sufficient for development). **A standalone `mongod` will not support these approval writes.**

For a local installation of MongoDB Community Server, start an isolated, development-only single-node replica set and initialize it once:

```bash
mkdir -p ./data/iremehub-mongo
mongod --dbpath ./data/iremehub-mongo --bind_ip 127.0.0.1 --replSet rs0 --port 27017
# In a second terminal, initialize the replica set if not already initialized:
mongosh --host 127.0.0.1:27017 --eval 'rs.initiate()'
```

The matching example URI is `mongodb://127.0.0.1:27017/iremehub_dev?replicaSet=rs0`. If your database is already a replica set, use its own connection URI and do not run `rs.initiate()` against it. Never run these development commands against a production database.

An isolated integration test should verify that a failed approval leaves all four records unchanged and that concurrent approvals cannot both succeed. These tests have **not** run against a live MongoDB in this work session.

## JWT revocation behavior

As an interim security measure, JWTs now include a **session version** checked against the user's current account record. Logout, password updates, password resets and role changes increment that version, invalidating **all previously issued JWTs for that account**. Older versionless tokens must sign in again.

This does **not** implement independent per-device sessions, a full refresh-token lifecycle, CSRF protection or the planned migration away from browser `localStorage`. If the logout network request fails, the client clears its token but cannot guarantee server-side revocation. Complete server-managed sessions before production.

## Build / test without choosing a host
```bash
cd client && npm ci && npm run typecheck && npm run lint && npm run build
cd ../server && npm ci && npm run test:policy && npx tsc --noEmit && npm run build
cd ../packages/core && npm ci && npm test
```

GitHub Actions is a **repository build/test service**, not a website host. Its failed jobs must be diagnosed separately from the discontinued Vercel deployment.

## Vercel cleanup and security
- Historical Vercel project metadata, `server/vercel.json`, and a Vercel environment export script were removed from the current tree. The app no longer has an intended Vercel deployment workflow.
- **Urgent secret rotation:** a formerly tracked setup helper embedded a MongoDB connection string containing credentials. Treat those credentials as compromised and replace the MongoDB user password, revoke the old user's access, and review Atlas database access logs. Do not use that connection string; old commits still retain it.
- Existing past commits may contain other hardcoded test credentials. Audit the repository and rotate any real credentials. For a public repo, merely deleting files or rewriting current content is **not sufficient** to revoke exposed secrets.

## Deferred deployment decisions
Later, choose hosting based on cost, regional latency, operational support, data-protection requirements, database needs, object storage, background workers and backups. At that point, add only the deployment-specific configuration for the selected platform.

**No production deployment, SaaS billing or real-user launch is authorized by this development note.**
