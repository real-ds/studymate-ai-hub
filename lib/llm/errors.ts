export class LLMRequestError extends Error {
  readonly provider: string
  readonly status?: number

  constructor(provider: string, message: string, status?: number) {
    super(message)
    this.name = "LLMRequestError"
    this.provider = provider
    this.status = status
  }
}

export function toLLMError(provider: string, err: unknown): LLMRequestError {
  if (err instanceof LLMRequestError) return err

  const message = err instanceof Error ? err.message : String(err)
  let status: number | undefined

  if (err && typeof err === "object") {
    const raw = err as { status?: unknown; statusCode?: unknown; code?: unknown }
    if (typeof raw.status === "number") status = raw.status
    else if (typeof raw.statusCode === "number") status = raw.statusCode
  }

  return new LLMRequestError(provider, message, status)
}

/**
 * Determines whether an endpoint should be temporarily taken out of rotation.
 * Network errors (no status) and auth/rate-limit/server errors trigger cooldown.
 */
export function shouldCooldown(err: unknown): boolean {
  if (!(err instanceof LLMRequestError)) return true
  const status = err.status
  if (status === undefined) return true
  if ([401, 402, 403, 408, 409, 425, 429].includes(status)) return true
  return status >= 500
}
