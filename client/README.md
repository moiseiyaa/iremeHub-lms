# iremehub+ — Web application

Responsive Next.js 15 / React 19 / TypeScript frontend for the iremehub+ LMS.

**Hosting provider: not selected.** The frontend can be developed and built locally without Vercel or any other hosted account. `API_PROXY_TARGET` is a server-side URL for the Express API.

## Local development

Node.js 22+ is recommended.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000. Start the API in a second terminal using the [backend guide](../server/README.md). The default API target is http://localhost:5000, and the browser always calls the same-origin `/api/v1/*` path.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run build
```

Current CI failures are not yet diagnosed. A working local page does **not** imply that API integration, mobile accessibility or production security is complete.

## Source layout
- `app/`: public pages, account flows, role-based workspaces and classrooms
- `components/`: iremehub+ shared UI and editor components
- `app/api/apiClient.ts`: canonical same-origin backend transport
- `app/styles/`: brand design tokens and workspace styling

The current backend still uses legacy browser bearer tokens. Secure, revocable sessions are part of the release gate, not a completed feature.

See [platform-independent development](../docs/HOST_INDEPENDENT_DEVELOPMENT.md) and [frontend renovation status](../docs/FRONTEND_RENOVATION.md).
