/**
 * Himetrica — Brazilian product analytics, browser-only tracker.
 *
 * Himetrica has no Node SDK (by design — the tracker runs in the
 * browser and ingests from there). This wrapper types their window
 * global so your call sites stay type-safe.
 *
 * HTML snippet to add in your layout head:
 *
 *   <script defer src="https://cdn.himetrica.com/tracker.js"
 *     data-api-key="${process.env.HIMETRICA_API_KEY}"></script>
 */

type HimetricaWindow = Window & {
  himetrica?: {
    track(event: string, props?: Record<string, unknown>): void;
    identify(user: { userId: string; name?: string; email?: string }): void;
    reset(): void;
  };
};

function h(): HimetricaWindow["himetrica"] | null {
  if (typeof window === "undefined") return null;
  return (window as HimetricaWindow).himetrica ?? null;
}

export function track(event: string, props?: Record<string, unknown>): void {
  h()?.track(event, props);
}

export function identify(user: {
  userId: string;
  name?: string;
  email?: string;
}): void {
  h()?.identify(user);
}

/** ALWAYS call on logout — otherwise next identify merges two users. */
export function reset(): void {
  h()?.reset();
}
