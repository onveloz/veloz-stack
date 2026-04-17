import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify an AbacatePay webhook signature.
 *
 * The `rawBody` MUST be the unparsed request body. If your HTTP framework
 * ate the body and re-stringified JSON, the signature will not match —
 * reach for `c.req.raw.clone().text()` on Hono, `req.text()` on Fetch, or
 * the `bodyParser: false` equivalent on your server.
 *
 * The `signature` is the value of the `X-Webhook-Signature` header.
 */
export function verifyAbacatePayWebhook(
  rawBody: string,
  signature: string | null | undefined,
  secret = process.env.ABACATE_WEBHOOK_SECRET,
): boolean {
  if (!signature || !secret) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
