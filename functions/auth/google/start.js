import { buildSupabaseGoogleAuthorizeUrl } from "../../_authFlow.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const subscriberId = (url.searchParams.get("subscriber_id") || "").trim();
  if (!subscriberId) {
    return new Response(JSON.stringify({ error: "Missing subscriber_id" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  try {
    const authorizeUrl = await buildSupabaseGoogleAuthorizeUrl(context.request.url, context.env, subscriberId);
    return Response.redirect(authorizeUrl, 302);
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}
