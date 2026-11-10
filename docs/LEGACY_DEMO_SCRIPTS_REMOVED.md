# Removed unsafe development scripts

On the Phase 3 branch, legacy scripts under `server/scripts/` that embedded database connection strings, hardcoded demo passwords or account-reset operations have been retired. They are not part of the production backend, but leaving them in a public repository created avoidable credential-exposure and accidental-data-modification risks.

**Important:** removal from the latest Git tree does not delete old commits. Revoke and rotate any live database credentials, inspect database audit logs, and rotate any other real secrets previously stored in Git history.

For a safe local setup:
1. Copy `server/.env.example` to `server/.env`.
2. Generate a new random `JWT_SECRET` of at least 32 characters and set an isolated local or development-only MongoDB URI.
3. Run `cd server && npm ci && npm run doctor`.
4. Run `npm run dev` to start the backend. The doctor command validates configuration shape only and never connects to the database.

Any seed or repair utilities must be reintroduced as explicitly test-scoped, typed scripts, with random credentials and deliberate safeguards against production databases. No old account-reset helpers are supported.
