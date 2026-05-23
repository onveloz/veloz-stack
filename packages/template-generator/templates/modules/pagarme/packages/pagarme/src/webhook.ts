/**
 * Pagar.me v5 webhooks don't use HMAC. They POST with HTTP Basic auth
 * using credentials you configured when registering the webhook. Verify
 * by decoding the Authorization header and comparing to your stored
 * user/pass.
 *
 * Expected header format: `Basic <base64(user:pass)>`.
 */
import { timingSafeEqual } from "node:crypto";

/** @internal Scaffold pipeline step. */
export function verifyPagarmeWebhook(
  authorizationHeader: string | null | undefined,
  user = process.env.PAGARME_WEBHOOK_USER,
  pass = process.env.PAGARME_WEBHOOK_PASS,
): boolean {
  if (!authorizationHeader || !user || !pass) return false;
  const match = authorizationHeader.match(/^Basic\s+(.+)$/i);
  if (!match || !match[1]) return false;

  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx < 0) return false;

  const recvUser = decoded.slice(0, idx);
  const recvPass = decoded.slice(idx + 1);

  const okUser = equal(recvUser, user);
  const okPass = equal(recvPass, pass);
  return okUser && okPass;
}

function equal(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

