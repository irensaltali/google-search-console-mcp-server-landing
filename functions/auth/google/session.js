import { proxyAuthRequest } from "../../_authProxy.js";

export async function onRequestPost(context) {
  return proxyAuthRequest(context, "/auth/google/session");
}
