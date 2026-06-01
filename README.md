# Google Search Console MCP Server Landing

Static landing page for:

https://google-search-console-mcp-server.irensaltali.com

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Pages Auth Proxy

This landing app includes first-party Pages Functions for auth routes:

- `/auth/google/start` (starts Supabase Google OAuth with signed state)
- `/auth/google/complete`
- `/auth/google/session`
- `/auth/debug` (deployment and auth-origin diagnostics)

Set these Pages environment variables in Cloudflare dashboard:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OAUTH_STATE_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Optional (already hardcoded in flow): `SUPABASE_PUBLISHABLE_KEY`

`/auth/debug` shows whether required variables are present.
