/**
 * In-memory sliding-window rate limiter. Good enough for V1 single-instance.
 * For multi-instance Vercel deploys this needs to move to Redis (Upstash).
 */
const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const events = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (events.length >= limit) {
    const retryAfterMs = events[0] + windowMs - now;
    buckets.set(key, events);
    return { ok: false, retryAfterMs };
  }

  events.push(now);
  buckets.set(key, events);
  return { ok: true };
}
