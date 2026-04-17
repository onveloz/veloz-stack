import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Mercado Pago webhook signature.
 *
 * MP sends `x-signature` as `ts=<ts>,v1=<hex>` and `x-request-id`. The
 * payload you HMAC is a specific template — a single missing `;`
 * silently invalidates the check, so we build it here once.
 *
 * Docs: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoWebhook(args: {
  signatureHeader: string | null | undefined;
  requestIdHeader: string | null | undefined;
  dataId: string;
  secret?: string;
}): boolean {
  const secret = args.secret ?? process.env.MP_WEBHOOK_SECRET;
  if (!secret || !args.signatureHeader || !args.requestIdHeader) return false;

  // "ts=<ts>,v1=<hex>"
  const parts = Object.fromEntries(
    args.signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim() ?? "", v?.trim() ?? ""];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${args.dataId};request-id:${args.requestIdHeader};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
