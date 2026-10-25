import { redis, isRedisAvailable } from "@/lib/redis"
import { shouldCooldown } from "./errors"

export { shouldCooldown }

const CURSOR_KEY = "llm:rr:cursor"
const COOLDOWN_PREFIX = "llm:cooldown:"
const DEFAULT_COOLDOWN_SECONDS = 300

let memoryCursor = 0
const memoryCooldowns = new Map<string, number>()

export function cooldownSeconds(): number {
  const raw = Number(process.env.LLM_COOLDOWN_SECONDS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_COOLDOWN_SECONDS
}

/**
 * Returns the next starting index of the round-robin cursor. Uses an atomic
 * Redis INCR so rotation stays fair across serverless instances, falling back
 * to an in-process counter when Redis is unavailable.
 */
export async function nextIndex(size: number): Promise<number> {
  if (size <= 0) return 0

  if (isRedisAvailable()) {
    try {
      const value = await redis!.incr(CURSOR_KEY)
      return (((value - 1) % size) + size) % size
    } catch {
      // fall through to memory
    }
  }

  const index = memoryCursor % size
  memoryCursor = (memoryCursor + 1) % Number.MAX_SAFE_INTEGER
  return index
}

export async function isCoolingDown(endpointId: string): Promise<boolean> {
  if (isRedisAvailable()) {
    try {
      const value = await redis!.get(COOLDOWN_PREFIX + endpointId)
      return value !== null && value !== undefined
    } catch {
      // fall through to memory
    }
  }

  const until = memoryCooldowns.get(endpointId)
  if (until === undefined) return false
  if (until <= Date.now()) {
    memoryCooldowns.delete(endpointId)
    return false
  }
  return true
}

export async function markCooldown(endpointId: string): Promise<void> {
  const ttl = cooldownSeconds()

  if (isRedisAvailable()) {
    try {
      await redis!.set(COOLDOWN_PREFIX + endpointId, "1", { ex: ttl })
      return
    } catch {
      // fall through to memory
    }
  }

  memoryCooldowns.set(endpointId, Date.now() + ttl * 1000)
}
