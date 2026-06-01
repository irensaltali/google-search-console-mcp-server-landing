import { renderCompletionPage } from "../../_authFlow.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const state = url.searchParams.get("state");
  if (!state) {
    return new Response("Missing OAuth state.", { status: 400 });
  }

  return new Response(renderCompletionPage(state), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
