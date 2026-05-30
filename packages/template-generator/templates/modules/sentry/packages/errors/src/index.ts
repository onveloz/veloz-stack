/**
 * Thin typed Sentry init for the server. Call initSentry() once at
 * process start; errors + unhandled rejections flow through automatically.
 *
 * For frontend, install @sentry/react / @sentry/astro / @sentry/nextjs
 * per-framework — they have platform-specific init paths.
 */
import * as Sentry from "@sentry/node";

/** @internal Scaffold pipeline step. */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // Silent no-op in dev
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.2,
    sendDefaultPii: false, // flip deliberately — never accidentally
  });
}

/** @internal Scaffold pipeline step. */
export function captureError(err: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

/** @internal Scaffold export. */
export { Sentry };


