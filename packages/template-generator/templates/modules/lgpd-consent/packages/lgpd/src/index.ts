/**
 * Minimal LGPD consent store. Client-side; decisions persist in localStorage.
 * Meant as a starting point — adapt categories to your actual trackers.
 */

export type ConsentCategories = {
  necessary: true;              // always on
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

const KEY = "lgpd:consent";

/** @internal Scaffold pipeline step. */
export function getConsent(): ConsentCategories | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConsentCategories;
  } catch {
    return null;
  }
}

/** @internal Scaffold pipeline step. */
export function setConsent(c: Omit<ConsentCategories, "necessary">): void {
  if (typeof localStorage === "undefined") return;
  const full: ConsentCategories = { necessary: true, ...c };
  localStorage.setItem(KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent("lgpd:consent-changed", { detail: full }));
}

/** @internal Scaffold pipeline step. */
export function hasAccepted(category: keyof ConsentCategories): boolean {
  const c = getConsent();
  return c ? c[category] === true : false;
}

/** @internal Scaffold pipeline step. */
export function revokeAll(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("lgpd:consent-changed", { detail: null }));
}

