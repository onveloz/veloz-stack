/**
 * Thin typed wrapper around `abacatepay-nodejs-sdk`.
 *
 * Money is ALWAYS centavos (integer). Passing 29.90 = R$ 0.30 — do not.
 * Use Math.round(reais * 100) at the call site if you have a decimal.
 */
import AbacatePay from "abacatepay-nodejs-sdk";

const key = process.env.ABACATE_KEY;
if (!key) {
  throw new Error("ABACATE_KEY is required (set it in .env — keys at app.abacatepay.com/api)");
}

const abacate = AbacatePay(key);

/** @internal Generated-app type. */
export type PixChargeInput = {
  /** Integer centavos. R$ 29,90 = 2990. */
  amountCentavos: number;
  description: string;
  /** Seconds from now until the QR expires. Default 1h. */
  expiresIn?: number;
  /** Optional customer payload. */
  customer?: {
    name: string;
    email: string;
    /** CPF digits only, no punctuation. */
    taxId: string;
    /** Brazilian cellphone, e.g. "+5511999998888". */
    cellphone: string;
  };
};

/**
 * The SDK response is a discriminated union `{ data: T } | { error: string }`.
 * We narrow via `"error" in res` so TypeScript knows `data` is present in the
 * happy path without a non-null assertion.
 */
function unwrap<T extends object>(res: T | { error: string }): T {
  if ("error" in res) throw new Error(`AbacatePay: ${(res as { error: string }).error}`);
  return res as T;
}

/** @internal Scaffold pipeline step. */
export async function createPixCharge(input: PixChargeInput) {
  if (!Number.isInteger(input.amountCentavos)) {
    throw new Error("amountCentavos must be an integer — you likely passed reais");
  }
  const res = await abacate.pixQrCode.create({
    amount: input.amountCentavos,
    expiresIn: input.expiresIn ?? 3600,
    description: input.description,
    customer: input.customer
      ? {
          name: input.customer.name,
          email: input.customer.email,
          taxId: input.customer.taxId,
          cellphone: input.customer.cellphone,
        }
      : undefined,
  });
  return unwrap(res as any);
}

/** @internal Scaffold pipeline step. */
export async function checkPixCharge(id: string) {
  const res = await abacate.pixQrCode.check({ id });
  return unwrap(res as any);
}

/** Dev-only. Fails with a clear error when called with a live key. */
export async function simulatePixPayment(id: string) {
  const res = await abacate.pixQrCode.simulatePayment({ id });
  return unwrap(res as any);
}

/** @internal Scaffold export. */
export { abacate };


