# iremehub+ frontend API configuration

All browser requests go to **`/api/v1/*` on the Next.js origin**, and Next.js forwards them to the backend. This is the canonical approach for local and deployed environments.

## Development
1. Start Express on `http://localhost:5000` as usual.
2. Start Next.js with `cd client && npm run dev`.
3. Next.js proxies `/api/:path*` to `http://localhost:5000/api/:path*`.

## Deployment
Set the **server-side** Next.js variable `API_PROXY_TARGET=https://backend.example.com` (base URL without `/api/v1`). A legacy absolute `NEXT_PUBLIC_API_BASE_URL` is accepted as fallback and normalized if it ends with `/api/v1`; prefer the private server-side variable for new deployments.

Do **not** prefix endpoints sent to `apiGet`, `apiPost`, etc. with `/api/v1`: pass `/courses`, `/auth/me`, etc.

The existing app still uses bearer tokens in browser storage. This is transitional and **not production-grade security**. Replace with revocable HttpOnly sessions and CSRF protection as part of the backend release gates. Never trust frontend role checks for authorization.
