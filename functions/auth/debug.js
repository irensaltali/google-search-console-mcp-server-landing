import { requiredConfigSummary } from "../_authFlow.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const payload = {
    ok: true,
    route: "/auth/debug",
    authMode: "first-party-supabase",
    deployedAtUtc: new Date().toISOString(),
    config: requiredConfigSummary(context.env),
    requestPath: url.pathname,
    requestQuery: Object.fromEntries(url.searchParams.entries()),
    expectsStartRedirectTo: `${String(context.env?.SUPABASE_URL || "<missing SUPABASE_URL>")}/auth/v1/authorize`
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
