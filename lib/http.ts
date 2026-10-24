/**
 * Shared helpers for safely reading API responses. Prevents the classic
 * "Unexpected token '<', \"<!DOCTYPE\"... is not valid JSON" error that happens
 * when a server returns an HTML page (framework error page, Vercel error page,
 * proxy/gateway error) instead of the expected JSON.
 */

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** Detects an HTML/XML document so we never try to JSON.parse it. */
export function isHtmlResponse(text: string): boolean {
  const head = text.trimStart().slice(0, 32).toLowerCase()
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("<?xml") ||
    head.startsWith("<!--")
  )
}

/**
 * Reads a Response as JSON, throwing a clear ApiError when the body is HTML or
 * otherwise not valid JSON.
 */
export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text()

  if (isHtmlResponse(text)) {
    throw new ApiError(
      `Server returned an HTML page instead of data (status ${res.status}).`,
      res.status
    )
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError(
      `Server returned an invalid JSON response (status ${res.status}).`,
      res.status
    )
  }
}

/**
 * Best-effort extraction of a human-readable error message from a failed
 * Response, tolerating HTML error pages and empty bodies.
 */
export async function readApiError(
  res: Response,
  fallback = `Request failed with status ${res.status}`
): Promise<string> {
  let text = ""
  try {
    text = await res.text()
  } catch {
    return fallback
  }

  if (isHtmlResponse(text)) {
    return `${fallback} (server returned an HTML error page, status ${res.status})`
  }

  try {
    const data = JSON.parse(text) as { error?: string; message?: string; detail?: string }
    return data.error || data.message || data.detail || fallback
  } catch {
    const trimmed = text.trim()
    return trimmed ? trimmed.slice(0, 200) : fallback
  }
}
