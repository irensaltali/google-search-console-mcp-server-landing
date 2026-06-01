import { proxyAuthRequest } from "../../_authProxy.js";

export async function onRequest(context) {
  return proxyAuthRequest(context, "/auth/google/complete");
}
