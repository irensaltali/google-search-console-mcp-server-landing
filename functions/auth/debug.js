const DEFAULT_AUTH_ORIGIN = "https://google-search-console-mcp-server.mcpize.run";

function authOrigin(env) {
  const value = env?.AUTH_PROXY_ORIGIN;
  return value && value.length > 0 ? value : DEFAULT_AUTH_ORIGIN;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const payload = {
    ok: true,
    route: "/auth/debug",
    deployedAtUtc: new Date().toISOString(),
    authProxyOrigin: authOrigin(context.env),
    requestPath: url.pathname,
    requestQuery: Object.fromEntries(url.searchParams.entries()),
    expectsStartRedirectTo: `${authOrigin(context.env)}/auth/google/start`
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
