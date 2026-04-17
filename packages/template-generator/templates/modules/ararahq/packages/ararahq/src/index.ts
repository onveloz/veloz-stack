/**
 * Thin typed wrapper around @ararahq/sdk. Supports SMS and WhatsApp.
 *
 * Key prefix controls environment: `ara_test_…` → sandbox, `ara_live_…` → prod.
 * Same base URL either way.
 */
import { NodeSDK } from "@ararahq/sdk";

const apiKey = process.env.ARARA_KEY;
if (!apiKey) {
  throw new Error("ARARA_KEY is required (ara_live_… or ara_test_…). Get one at app.ararahq.com");
}

export const ararahq = new NodeSDK({ apiKey });

/** BR cellphone format: +5511999998888 (country + area + number, digits only). */
export type BrPhone = `+55${string}`;

/**
 * Fire an SMS. Most commonly used for OTP auth codes — generate the code
 * yourself, store hashed in the DB, then call this to deliver it.
 */
export async function sendSms(phone: BrPhone, message: string) {
  return ararahq.messages.send({
    receiver: `sms:${phone}`,
    content: message,
  });
}

/**
 * Fire a WhatsApp template. Templates must be pre-approved by Meta — create
 * them in the Ararahq dashboard or directly in WhatsApp Business Manager.
 * Freeform (non-template) messages only work inside the 24-hour customer
 * service window; this helper does not handle that case.
 */
export async function sendWhatsAppTemplate(
  phone: BrPhone,
  templateName: string,
  variables: string[] = [],
) {
  return ararahq.messages.send({
    receiver: `whatsapp:${phone}`,
    templateName,
    variables,
  });
}

/**
 * Convenience: generate a 6-digit OTP, send via SMS, return the code so
 * the caller can hash+store it. Do NOT log the returned code.
 */
export async function sendSmsOtp(phone: BrPhone): Promise<{ code: string }> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await sendSms(phone, `Seu código: ${code}. Válido por 5 minutos.`);
  return { code };
}
