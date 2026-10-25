export enum LLMErrorType {
  RATE_LIMIT = "rate_limit",
  UNAVAILABLE = "unavailable",
  AUTH_ERROR = "auth_error",
  SERVER_ERROR = "server_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN = "unknown",
}

export class LLMRequestError extends Error {
  readonly provider: string
  readonly status?: number
  readonly errorType: LLMErrorType
  readonly modelId: string

  constructor(provider: string, message: string, status?: number, errorType: LLMErrorType = LLMErrorType.UNKNOWN, modelId: string = "") {
    super(message)
    this.name = "LLMRequestError"
    this.provider = provider
    this.status = status
    this.errorType = errorType
    this.modelId = modelId
  }
}

export function toLLMError(provider: string, err: unknown, modelId: string = ""): LLMRequestError {
  if (err instanceof LLMRequestError) {
    err.modelId = modelId
    return err
  }

  const message = err instanceof Error ? err.message : String(err)
  let status: number | undefined

  if (err && typeof err === "object") {
    const raw = err as { status?: unknown; statusCode?: unknown; code?: unknown }
    if (typeof raw.status === "number") status = raw.status
    else if (typeof raw.statusCode === "number") status = raw.statusCode
  }

  let errorType: LLMErrorType = LLMErrorType.UNKNOWN

  if (status === 429) errorType = LLMErrorType.RATE_LIMIT
  else if (status === 503 || status === 408) errorType = LLMErrorType.UNAVAILABLE
  else if (status === 401 || status === 403) errorType = LLMErrorType.AUTH_ERROR
  else if (status >= 500) errorType = LLMErrorType.SERVER_ERROR
  else if (!status) errorType = LLMErrorType.NETWORK_ERROR

  return new LLMRequestError(provider, message, status, errorType, modelId)
}

/**
 * Extracts a user-friendly message from an LLM error.
 * Handles LLMRequestError with modelId/errorType, or generic Error.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof LLMRequestError) {
    const prefix = error.errorType === LLMErrorType.RATE_LIMIT ? 'Rate limited' : error.errorType === LLMErrorType.UNAVAILABLE ? 'Unavailable' : ''
    return `${prefix}: ${error.message} (model: ${error.modelId})`.trim()
  }
  if (error instanceof Error) return error.message
  return String(error)
}
  if (!(err instanceof LLMRequestError)) return true
  const status = err.status
  if (status === undefined) return true
  if ([401, 402, 403, 408, 409, 425, 429].includes(status)) return true
  return status >= 500
}

/**
 * Gets the CSS class for styling the error message based on error type.
 * Returns orange for rate_limit/unavailable, red for auth/server, gray for network/unknown.
 */
export function getErrorClass(errorType: LLMErrorType): string {
  switch (errorType) {
    case LLMErrorType.RATE_LIMIT:
    case LLMErrorType.UNAVAILABLE:
      return "bg-orange-500/10 border-orange-500 text-orange-400"
    case LLMErrorType.AUTH_ERROR:
    case LLMErrorType.SERVER_ERROR:
      return "bg-red-500/10 border-red-500 text-red-400"
    case LLMErrorType.NETWORK_ERROR:
    case LLMErrorType.UNKNOWN:
      return "bg-gray-500/10 border-gray-300 text-gray-400"
    default:
      return "bg-gray-500/10 border-gray-300 text-gray-400"
  }
}
