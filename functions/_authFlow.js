const GOOGLE_WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";

function requiredEnv(env, key) {
  const value = env?.[key];
  const normalized = value ? String(value).trim() : "";
  if (!normalized) {
    throw new Error(`Missing required Pages environment variable: ${key}`);
  }
  return normalized;
}

function textEncoder() {
  return new TextEncoder();
}

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toBase64(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function sha256Bytes(input) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder().encode(input));
  return new Uint8Array(digest);
}

async function deriveKeyBytes(secret) {
  if (/^[a-f0-9]{64}$/i.test(secret)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i += 1) {
      out[i] = Number.parseInt(secret.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }

  try {
    const decoded = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0));
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // no-op
  }

  return sha256Bytes(secret);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createOAuthState(subscriberId, secret) {
  const payload = {
    subscriberId,
    createdAt: Date.now()
  };
  const encodedPayload = toBase64Url(textEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder().encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyOAuthState(state, secret) {
  const [payloadPart, signaturePart] = String(state || "").split(".");
  if (!payloadPart || !signaturePart) {
    throw new Error("Invalid OAuth state format");
  }

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signaturePart),
    textEncoder().encode(payloadPart)
  );
  if (!valid) {
    throw new Error("Invalid OAuth state signature");
  }

  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)));
  if (!payload.subscriberId || !payload.createdAt) {
    throw new Error("Invalid OAuth state payload");
  }
  return payload;
}

export async function encryptRefreshToken(plaintext, secret, aad) {
  const keyBytes = await deriveKeyBytes(secret);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: textEncoder().encode(aad) },
    cryptoKey,
    textEncoder().encode(plaintext)
  );

  const cipherBytes = new Uint8Array(cipher);
  const tagLength = 16;
  const authTag = cipherBytes.slice(cipherBytes.length - tagLength);
  const ciphertext = cipherBytes.slice(0, cipherBytes.length - tagLength);

  const payload = {
    v: 1,
    iv: toBase64(iv),
    tag: toBase64(authTag),
    ciphertext: toBase64(ciphertext)
  };
  return toBase64Url(textEncoder().encode(JSON.stringify(payload)));
}

export async function buildSupabaseGoogleAuthorizeUrl(requestUrl, env, subscriberId) {
  const supabaseUrl = requiredEnv(env, "SUPABASE_URL");
  const stateSecret = requiredEnv(env, "OAUTH_STATE_SECRET");
  const state = await createOAuthState(subscriberId, stateSecret);

  const completeUrl = new URL("/auth/google/complete", requestUrl);
  completeUrl.searchParams.set("state", state);

  const authorizeUrl = new URL("/auth/v1/authorize", supabaseUrl);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", completeUrl.toString());
  authorizeUrl.searchParams.set("scopes", GOOGLE_WEBMASTERS_SCOPE);
  authorizeUrl.searchParams.set("access_type", "offline");
  authorizeUrl.searchParams.set("prompt", "consent");

  return authorizeUrl.toString();
}

export function renderCompletionPage(state) {
  const escapedState = JSON.stringify(state);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Google Search Console connected</title>
  <style>
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;display:grid;min-height:100vh;place-items:center;background:#f7f7f5;color:#202124}
    main{max-width:34rem;padding:2rem}
    h1{font-size:1.5rem;margin:0 0 .75rem}
    p{line-height:1.5}
  </style>
</head>
<body>
  <main>
    <h1>Connecting Google Search Console...</h1>
    <p id="status">Finishing the secure connection.</p>
  </main>
  <script>
    const state = ${escapedState};
    const statusEl = document.getElementById("status");
    const params = new URLSearchParams(window.location.hash.slice(1));
    const payload = Object.fromEntries(params.entries());
    payload.state = state;

    fetch("/auth/google/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).then(async (response) => {
      if (!response.ok) throw new Error(await response.text());
      statusEl.textContent = "Connected. You can close this tab and return to your MCP client.";
      history.replaceState(null, "", window.location.pathname);
    }).catch((error) => {
      statusEl.textContent = "Connection failed: " + error.message;
    });
  </script>
</body>
</html>`;
}

export async function fetchGoogleProfile(providerToken) {
  if (!providerToken) {
    return {};
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      authorization: `Bearer ${providerToken}`
    }
  });
  if (!response.ok) {
    return {};
  }

  const data = await response.json();
  return {
    sub: data.id || undefined,
    email: data.email || undefined
  };
}

export async function upsertGoogleAccount(env, account) {
  const supabaseUrl = requiredEnv(env, "SUPABASE_URL");
  const secretKey = requiredEnv(env, "SUPABASE_SECRET_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/gsc_google_accounts?on_conflict=subscriber_id`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: secretKey,
      authorization: `Bearer ${secretKey}`,
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(account)
  });

  if (!response.ok) {
    throw new Error(`Failed to store Google account: ${await response.text()}`);
  }
}

export function requiredConfigSummary(env) {
  return {
    hasSupabaseUrl: Boolean(env?.SUPABASE_URL),
    hasSupabaseSecretKey: Boolean(env?.SUPABASE_SECRET_KEY),
    hasOAuthStateSecret: Boolean(env?.OAUTH_STATE_SECRET),
    hasTokenEncryptionKey: Boolean(env?.TOKEN_ENCRYPTION_KEY)
  };
}
