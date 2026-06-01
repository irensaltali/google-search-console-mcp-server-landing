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

This landing app includes Pages Functions for auth routes:

- `/auth/google/start` (browser redirect to auth origin, preserves query string)
- `/auth/google/complete`
- `/auth/google/session`

Set this Pages environment variable in Cloudflare dashboard:

`AUTH_PROXY_ORIGIN=https://<your-mcp-server-origin>`

Example:

`AUTH_PROXY_ORIGIN=https://google-search-console-mcp-server.mcpize.run`
