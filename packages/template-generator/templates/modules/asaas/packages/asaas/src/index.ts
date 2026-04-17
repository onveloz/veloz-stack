/**
 * Thin typed wrapper around Asaas's REST API.
 * No official SDK — we wrap `fetch` to keep the surface small.
 *
 * Money is in REAIS (decimal). Opposite of AbacatePay / Pagar.me (centavos).
 * Customer must pre-exist with a valid CPF or CNPJ.
 */

const apiKey = process.env.ASAAS_KEY;
if (!apiKey) {
  throw new Error("ASAAS_KEY is required ($aact_prod_... or $aact_hmlg_...)");
}

const isSandbox = apiKey.startsWith("$aact_hmlg_");
const base = isSandbox ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(base + path, {
    ...init,
    headers: {
      access_token: apiKey!,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Asaas ${path} ${r.status}: ${body}`);
  }
  return (await r.json()) as T;
}

export type Customer = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
};

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";

export type Payment = {
  id: string;
  customer: string;
  billingType: BillingType;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
};

export function createCustomer(body: {
  name: string;
  email: string;
  /** CPF or CNPJ, digits only. */
  cpfCnpj: string;
  phone?: string;
}) {
  return req<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createPayment(body: {
  /** Customer id returned by createCustomer. */
  customer: string;
  billingType: BillingType;
  /** Value in reais (decimal). R$ 29,90 = 29.9. */
  value: number;
  /** ISO date, e.g. "2026-04-20". */
  dueDate: string;
  description?: string;
}) {
  return req<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getPixQr(paymentId: string) {
  return req<{
    encodedImage: string;
    payload: string;
    expirationDate: string;
  }>(`/payments/${paymentId}/pixQrCode`);
}

export function getPayment(paymentId: string) {
  return req<Payment>(`/payments/${paymentId}`);
}
