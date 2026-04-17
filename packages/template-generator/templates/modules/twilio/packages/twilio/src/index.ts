/**
 * Typed Twilio client. Global reach for SMS / WhatsApp / voice.
 *
 * For Brazil-only use, prefer @proj/ararahq which is localized + cheaper.
 * Twilio shines when you need multi-country or voice.
 */
import Twilio from "twilio";

const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
if (!sid || !token) {
  throw new Error("TWILIO_SID and TWILIO_TOKEN are required");
}

export const twilio = Twilio(sid, token);

const smsFrom = process.env.TWILIO_SMS_FROM;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

export async function sendSms(to: string, body: string) {
  if (!smsFrom) throw new Error("TWILIO_SMS_FROM is required for sendSms");
  return twilio.messages.create({ from: smsFrom, to, body });
}

export async function sendWhatsApp(to: `+${string}`, body: string) {
  return twilio.messages.create({
    from: whatsappFrom,
    to: `whatsapp:${to}`,
    body,
  });
}

/** Verify Twilio webhook signatures with their own SDK helper. */
export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, unknown>,
): boolean {
  const token = process.env.TWILIO_TOKEN;
  if (!token) return false;
  return Twilio.validateRequest(token, signature, url, params);
}
