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

This flow uses Supabase Google OAuth. The Google web client itself is not embedded in the landing code. It must be configured in Supabase Auth and in Google Cloud for the same project.

Current Google OAuth web client:

```text
219391673793-bd9k06kvocj4i5i4820srffv7s838arm.apps.googleusercontent.com
```

Required Google Cloud redirect URIs:

```text
https://google-search-console-mcp-server.irensaltali.com
https://google-search-console-mcp-server.irensaltali.com/auth/google/complete
https://bbihthevyhrjemiwqzwh.supabase.co/auth/v1/callback
```

Required Google Cloud JavaScript origins:

```text
https://google-search-console-mcp-server.irensaltali.com
https://bbihthevyhrjemiwqzwh.supabase.co
```

Set these Pages environment variables in Cloudflare dashboard:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OAUTH_STATE_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Optional (already hardcoded in flow): `SUPABASE_PUBLISHABLE_KEY`

`/auth/debug` shows whether required variables are present.
