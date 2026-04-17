/**
 * Typed Pagar.me v5 client. Wraps fetch directly — Pagar.me's first-party
 * Node SDK drifts between major versions, fetch is the stable surface.
 *
 * Money is in CENTAVOS (integer). R$ 29,90 = 2990.
 *
 * Auth is HTTP Basic with the secret key as user and empty password —
 * mind the trailing colon when you base64-encode.
 */

const sk = process.env.PAGARME_SK;
if (!sk) {
  throw new Error("PAGARME_SK is required (sk_live_... or sk_test_...)");
}

const BASE = "https://api.pagar.me/core/v5";
const auth = "Basic " + Buffer.from(`${sk}:`).toString("base64");

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(BASE + path, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Pagar.me ${path} ${r.status}: ${body}`);
  }
  return (await r.json()) as T;
}

export type PixOrderInput = {
  /** Integer centavos. Caller must `Math.round(reais * 100)` if they have decimals. */
  amountCentavos: number;
  description: string;
  customer: {
    name: string;
    email: string;
    /** CPF or CNPJ, digits only. */
    document: string;
    type?: "individual" | "company";
  };
  /** PIX QR expiry, seconds from now. Default 1h. */
  pixExpiresIn?: number;
};

export function createPixOrder(input: PixOrderInput) {
  return req<{ id: string; charges: Array<{ id: string; last_transaction: unknown }> }>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            amount: input.amountCentavos,
            description: input.description,
            quantity: 1,
          },
        ],
        customer: {
          name: input.customer.name,
          email: input.customer.email,
          type: input.customer.type ?? "individual",
          document: input.customer.document,
        },
        payments: [
          {
            payment_method: "pix",
            pix: { expires_in: input.pixExpiresIn ?? 3600 },
          },
        ],
      }),
    },
  );
}

export function getOrder(id: string) {
  return req<{ id: string; status: string }>(`/orders/${id}`);
}
