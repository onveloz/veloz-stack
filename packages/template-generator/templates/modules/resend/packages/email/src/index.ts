/**
 * Thin typed wrapper around Resend. Keep it small — the official SDK is
 * already good; this exists so the rest of the app imports a single
 * @proj/email surface that we can swap later without touching callers.
 */
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is required (re_…). Create one at resend.com/api-keys");
}

export const resend = new Resend(apiKey);

const FROM_DEFAULT = process.env.EMAIL_FROM ?? "Veloz <noreply@veloz.local>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!input.html && !input.text && !input.react) {
    throw new Error("sendEmail: provide one of html, text, or react");
  }
  const res = await resend.emails.send({
    from: input.from ?? FROM_DEFAULT,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    react: input.react,
    replyTo: input.replyTo,
  } as Parameters<typeof resend.emails.send>[0]);

  if (res.error) throw new Error(`Resend: ${res.error.message}`);
  return res.data!;
}
