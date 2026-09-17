import { env } from '@/env';

/**
 * Base URL of the backend (origin only, no path), or `undefined` when the
 * backend is reached on the page's own origin.
 *
 * In the browser the backend is same-origin: the Caddy proxy serves the whole
 * app on `https://localhost:3000` and forwards `/api/*` to the backend, so requests
 * use relative URLs and stay on HTTPS. The Vite dev server has no such proxy,
 * so development falls back to the backend's own port. `VITE_API_URL`
 * overrides both.
 *
 * During SSR there is no page origin to be relative to, so the frontend server
 * calls the backend directly through `SERVER_URL` (the Compose service name).
 */
export function getApiBaseUrl(): string | undefined {
  if (typeof window === 'undefined') {
    return env.SERVER_URL ?? env.VITE_API_URL ?? 'http://localhost:3001';
  }
  return env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3001' : undefined);
}
