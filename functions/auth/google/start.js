const DEFAULT_AUTH_ORIGIN = "https://google-search-console-mcp-server.mcpize.run";

function authOrigin(env) {
  const value = env?.AUTH_PROXY_ORIGIN;
  return value && value.length > 0 ? value : DEFAULT_AUTH_ORIGIN;
}

export async function onRequestGet(context) {
  const source = new URL(context.request.url);
  const destination = new URL("/auth/google/start", authOrigin(context.env));
  destination.search = source.search;
  return Response.redirect(destination.toString(), 302);
}
