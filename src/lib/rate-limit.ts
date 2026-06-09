/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Limits to `maxRequests` per `windowMs` per key (e.g. IP).
 * Note: resets on server restart; suitable for single-instance deployments.
 */

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

export interface RateLimitOptions {
  windowMs: number   // time window in ms
  maxRequests: number
}

export function rateLimit(key: string, opts: RateLimitOptions): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true, retryAfter: 0 }
  }

  if (entry.count >= opts.maxRequests) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true, retryAfter: 0 }
}

/** Get IP from Next.js request headers (works behind proxies). */
export function getIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
