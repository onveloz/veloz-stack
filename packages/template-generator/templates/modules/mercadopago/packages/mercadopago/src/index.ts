/**
 * Typed Mercado Pago client. Handles the Brazilian payment mix
 * (cards + PIX + boleto).
 *
 * Money is in REAIS (decimal). R$ 29,90 = 29.9. This differs from
 * Stripe / AbacatePay / Pagar.me which use centavos.
 */
import { MercadoPagoConfig, Payment, Preference, Customer } from "mercadopago";

const accessToken = process.env.MP_TOKEN;
if (!accessToken) {
  throw new Error("MP_TOKEN is required (TEST-... or live token). See dashboard → Credentials.");
}

/** @internal Scaffold export. */
export const mp = new MercadoPagoConfig({ accessToken });

/** @internal Scaffold export. */
export const payments = new Payment(mp);
/** @internal Scaffold export. */
export const preferences = new Preference(mp);
/** @internal Scaffold export. */
export const customers = new Customer(mp);

/** @internal Generated-app type. */
export type PixPaymentInput = {
  /** Reais as decimal, e.g. 29.9 for R$ 29,90. */
  amountReais: number;
  description: string;
  payerEmail: string;
  /** Optional idempotency key — IF YOU SKIP THIS PRODUCTION WILL DOUBLE-CHARGE. */
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

/** @internal Scaffold pipeline step. */
export async function createPixPayment(input: PixPaymentInput) {
  const idempotencyKey = input.idempotencyKey ?? crypto.randomUUID();
  return payments.create({
    body: {
      transaction_amount: input.amountReais,
      description: input.description,
      payment_method_id: "pix",
      payer: { email: input.payerEmail },
      metadata: input.metadata,
    },
    requestOptions: { idempotencyKey },
  });
}

/** @internal Scaffold pipeline step. */
export async function getPayment(id: string | number) {
  return payments.get({ id: String(id) });
}


