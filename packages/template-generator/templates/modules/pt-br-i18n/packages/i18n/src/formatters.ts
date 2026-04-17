/**
 * pt-BR formatting helpers — use these, not raw Intl at call sites.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATETIME = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** AbacatePay / Pagar.me style: integer centavos → "R$ 29,90". */
export function formatCentavos(cents: number): string {
  return BRL.format(cents / 100);
}

/** Asaas / MercadoPago style: decimal reais → "R$ 29,90". */
export function formatReais(reais: number): string {
  return BRL.format(reais);
}

export function formatDate(d: Date | string): string {
  return DATE.format(typeof d === "string" ? new Date(d) : d);
}

export function formatDateTime(d: Date | string): string {
  return DATETIME.format(typeof d === "string" ? new Date(d) : d);
}
