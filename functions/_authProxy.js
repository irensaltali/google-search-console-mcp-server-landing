const DEFAULT_AUTH_ORIGIN = "https://google-search-console-mcp-server.mcpize.run";

function authOrigin(env) {
  const value = env?.AUTH_PROXY_ORIGIN;
  return value && value.length > 0 ? value : DEFAULT_AUTH_ORIGIN;
}

export async function proxyAuthRequest(context, path) {
  const upstreamUrl = new URL(path, authOrigin(context.env));
  upstreamUrl.search = new URL(context.request.url).search;

  const headers = new Headers(context.request.headers);
  headers.delete("host");

  const init = {
    method: context.request.method,
    headers,
    redirect: "manual"
  };

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    init.body = context.request.body;
  }

  const upstreamResponse = await fetch(upstreamUrl.toString(), init);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers
  });
}
