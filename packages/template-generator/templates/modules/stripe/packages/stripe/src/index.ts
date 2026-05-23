/**
 * Typed Stripe client. Money is in CENTAVOS (integer, same as Stripe's
 * universal "smallest currency unit" convention).
 *
 * For BR payment methods (boleto, PIX, pay-in-installments), you need a
 * Stripe Brazil account — not a US account. The currency must be "brl".
 */
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET;
if (!secret) {
  throw new Error("STRIPE_SECRET is required (sk_live_... or sk_test_...)");
}

/** @internal Scaffold export. */
export const stripe = new Stripe(secret, {
  apiVersion: "2025-01-27.acacia",
});

/** @internal Generated-app type. */
export type BrPaymentMethod = "card" | "boleto" | "pix";

/**
 * Create a PaymentIntent suited for the Brazilian payment mix.
 * Amount is centavos (integer): R$ 29,90 = 2990.
 */
export function createBrPaymentIntent(input: {
  amountCentavos: number;
  methods?: BrPaymentMethod[];
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  if (!Number.isInteger(input.amountCentavos)) {
    throw new Error("amountCentavos must be an integer — did you pass reais?");
  }
  return stripe.paymentIntents.create({
    amount: input.amountCentavos,
    currency: "brl",
    payment_method_types: input.methods ?? ["card", "boleto", "pix"],
    receipt_email: input.customerEmail,
    description: input.description,
    metadata: input.metadata,
  });
}

