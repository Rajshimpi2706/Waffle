/**
 * Rate limiting utility
 * Uses in-memory store by default.
 * Set UPSTASH_REDIS_URL for production multi-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (single process / dev only)
const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g. "auth", "coupon") */
  prefix: string;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(ip: string, config: RateLimitConfig): RateLimitResult {
  const key = `${config.prefix}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Pre-configured limiters
export const authLimiter: RateLimitConfig = {
  prefix: 'auth',
  limit: 5,
  windowSeconds: 900, // 15 minutes
};

export const couponLimiter: RateLimitConfig = {
  prefix: 'coupon',
  limit: 10,
  windowSeconds: 60,
};

export const orderLimiter: RateLimitConfig = {
  prefix: 'order',
  limit: 3,
  windowSeconds: 60,
};

export const orderRateLimit = {
  check: async (ip: string) => {
    const res = rateLimit(ip, orderLimiter);
    return res.allowed;
  }
};

export const paymentRetryLimiter: RateLimitConfig = {
  prefix: 'payment_retry',
  limit: 5,
  windowSeconds: 300, // 5 minutes
};

/** Extract IP from a Next.js Request */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

/** Return a 429 Response with Retry-After header */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
