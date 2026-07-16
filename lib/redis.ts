import { Redis } from "@upstash/redis"

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    return new Redis({ url, token })
  } catch {
    return null
  }
}

export const redis = createRedisClient()

export function isRedisAvailable(): boolean {
  return redis !== null
}
