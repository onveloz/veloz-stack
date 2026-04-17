/**
 * Asaas webhook verifier.
 *
 * Asaas does NOT use HMAC. They send a shared-secret token in the
 * `asaas-access-token` header; you compare it string-wise to the token
 * you configured when registering the webhook in the dashboard.
 *
 * Uses timing-safe equality to avoid leaking secret length.
 */
import { timingSafeEqual } from "node:crypto";

export function verifyAsaasWebhook(
  receivedToken: string | null | undefined,
  expected = process.env.ASAAS_WEBHOOK_TOKEN,
): boolean {
  if (!receivedToken || !expected) return false;
  const a = Buffer.from(receivedToken);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
