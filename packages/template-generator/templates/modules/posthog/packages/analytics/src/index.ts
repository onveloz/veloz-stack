/**
 * Typed PostHog server client. Use server-side for anything revenue-related
 * (client-side can be blocked by ad-blockers).
 *
 * ALWAYS call `shutdown()` before process exit — PostHog batches events in
 * memory and you'll drop the queue otherwise.
 */
import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_KEY;
if (!apiKey) {
  throw new Error("POSTHOG_KEY is required (phc_...)");
}

export const posthog = new PostHog(apiKey, {
  host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
  flushAt: 20,
  flushInterval: 10_000,
});

export async function captureEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  posthog.capture({ distinctId, event, properties });
}

export async function isFeatureEnabled(
  flagKey: string,
  distinctId: string,
): Promise<boolean> {
  const v = await posthog.isFeatureEnabled(flagKey, distinctId);
  return v === true;
}

/** Call this once on process shutdown (SIGTERM etc.) to flush the queue. */
export async function shutdownPosthog() {
  await posthog.shutdown();
}
