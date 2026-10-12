import { SITE } from '../config/site';

export interface VisitStats {
  since: string | null;
  cities: { city: string; country: string; lat: number; lon: number; visits: number }[];
}

declare global {
  interface Window {
    __visitStats?: Promise<VisitStats | null>;
  }
}

/**
 * Record this page view with the visitor API (which counts each visitor at most
 * once per day) and resolve to the current map stats. Called by every page via
 * BaseLayout and again by GlobalReach; the promise is shared on `window` so a
 * page only ever sends one request, even if this module is bundled twice.
 * Resolves to null when the API is not configured or unreachable.
 */
export function recordVisit(): Promise<VisitStats | null> {
  if (!SITE.visitorApi) return Promise.resolve(null);
  window.__visitStats ??= fetch(`${SITE.visitorApi.replace(/\/$/, '')}/visit`, { method: 'POST', keepalive: true })
    .then((res) => (res.ok ? (res.json() as Promise<VisitStats>) : null))
    .catch(() => null);
  return window.__visitStats;
}
