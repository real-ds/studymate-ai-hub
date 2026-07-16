import { redis, isRedisAvailable } from "./redis"

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

/**
 * Convenience helper: returns a 429 Response if rate limited, null otherwise.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowSeconds: number = 60
): Promise<Response | null> {
  const result = await rateLimit(identifier, limit, windowSeconds)
  if (!result.success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.reset - Math.floor(Date.now() / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }
  return null
}

/**
 * Fixed-window rate limiter using Upstash Redis.
 * Falls back to allowing the request if Redis is unavailable.
 */
export async function rateLimit(
  identifier: string,
  limit: number = 20,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  if (!isRedisAvailable()) {
    return { success: true, remaining: limit, reset: 0, limit }
  }

  const key = `ratelimit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds

  const multi = redis!.multi()
  multi.zremrangebyscore(key, 0, windowStart)
  multi.zadd(key, { score: now, member: `${now}:${crypto.randomUUID()}` })
  multi.zcard(key)
  multi.expire(key, windowSeconds)
  const [, , countResult] = await multi.exec()

  const count = (countResult as number | undefined) ?? 0

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: now + windowSeconds,
    limit,
  }
}
