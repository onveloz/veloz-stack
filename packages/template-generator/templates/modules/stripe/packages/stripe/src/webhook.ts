import { stripe } from "./index";

/**
 * Verify a Stripe webhook. The `rawBody` MUST be the unparsed request
 * body — if your HTTP framework middleware already parsed JSON, the
 * signature won't match. Use c.req.raw.clone().text() on Hono, or
 * disable bodyParser on your webhook route elsewhere.
 */
export function verifyStripeWebhook(rawBody: string, signature: string | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is required");
  if (!signature) throw new Error("Missing stripe-signature header");
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
