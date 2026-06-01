import { encryptRefreshToken, fetchGoogleProfile, upsertGoogleAccount, verifyOAuthState } from "../../_authFlow.js";

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const state = payload?.state;
    const providerRefreshToken = payload?.provider_refresh_token;

    if (!state || !providerRefreshToken) {
      return new Response(JSON.stringify({ error: "Missing state or provider_refresh_token" }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    const verifiedState = await verifyOAuthState(state, String(context.env.OAUTH_STATE_SECRET || ""));
    const profile = await fetchGoogleProfile(payload?.provider_token);
    const encrypted = await encryptRefreshToken(
      String(providerRefreshToken),
      String(context.env.TOKEN_ENCRYPTION_KEY || ""),
      verifiedState.subscriberId
    );

    await upsertGoogleAccount(context.env, {
      subscriber_id: verifiedState.subscriberId,
      supabase_user_id: null,
      google_user_id: profile.sub ?? null,
      google_email: profile.email ?? null,
      provider_refresh_token_ciphertext: encrypted,
      scopes: ["https://www.googleapis.com/auth/webmasters"],
      updated_at: new Date().toISOString(),
      last_connected_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ connected: true, googleEmail: profile.email ?? null }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}
