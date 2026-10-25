import type { LLMProvider } from "./provider"
import { LLMRequestError } from "./errors"
import { isHtmlResponse } from "@/lib/http"

export interface OpenAICompatibleOptions {
  /** Unique identifier used for logs and cooldown tracking, e.g. "xkiro:qwen/qwen3.8-max:free". */
  id: string
  baseURL: string
  apiKey: string
  model: string
  /** Optional extra request headers (e.g. OpenRouter attribution headers). */
  extraHeaders?: Record<string, string>
  /** Timeout for non-streaming text/JSON requests, in milliseconds. */
  timeoutMs?: number
}

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

const DEFAULT_TIMEOUT_MS = 120_000

/**
 * Reads a provider response as JSON, classifying HTML/XML bodies (gateway
 * error pages, Cloudflare interstitials, misrouted requests) as LLM errors so
 * a raw "Unexpected token '<', \"<!DOCTYPE\"" never surfaces.
 */
async function readJsonBody(res: Response, provider: string): Promise<unknown> {
  const text = await res.text().catch(() => "")
  if (isHtmlResponse(text)) {
    throw new LLMRequestError(
      provider,
      `${provider} returned an HTML page instead of JSON (status ${res.status})`,
      res.status
    )
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new LLMRequestError(
      provider,
      `${provider} returned invalid JSON (status ${res.status}): ${text.slice(0, 200)}`,
      res.status
    )
  }
}

function readChoiceContent(data: unknown, kind: "message" | "delta"): string {
  if (!data || typeof data !== "object") return ""
  const choices = (data as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) return ""
  const choice = choices[0]
  if (!choice || typeof choice !== "object") return ""

  const record = choice as {
    message?: { content?: unknown }
    delta?: { content?: unknown }
    text?: unknown
  }
  const container = kind === "message" ? record.message : record.delta
  const content = container?.content
  if (typeof content === "string") return content
  if (typeof record.text === "string") return record.text
  return ""
}

/**
 * Strips markdown fences and extracts the first balanced JSON value found in a
 * string, so slow/loose models that wrap JSON in prose still parse.
 */
export function parseJsonLoose<T>(raw: string): T {
  const withoutFences = raw.replace(/```(?:json)?\s*/gi, "").trim()

  if (isHtmlResponse(withoutFences)) {
    throw new LLMRequestError(
      "parser",
      `Model returned an HTML response instead of JSON: ${withoutFences.slice(0, 200)}`
    )
  }

  try {
    return JSON.parse(withoutFences) as T
  } catch {
    // fall through to balanced extraction
  }

  const firstObj = withoutFences.indexOf("{")
  const firstArr = withoutFences.indexOf("[")
  let start = -1
  let close = ""

  if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
    start = firstObj
    close = "}"
  } else if (firstArr !== -1) {
    start = firstArr
    close = "]"
  }

  if (start !== -1) {
    const end = withoutFences.lastIndexOf(close)
    if (end > start) {
      const candidate = withoutFences.slice(start, end + 1)
      try {
        return JSON.parse(candidate) as T
      } catch {
        // fall through
      }
    }
  }

  throw new LLMRequestError(
    "parser",
    `Failed to parse JSON from model response: ${withoutFences.slice(0, 200)}`
  )
}

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name: string
  readonly model: string

  private readonly baseURL: string
  private readonly apiKey: string
  private readonly extraHeaders: Record<string, string>
  private readonly timeoutMs: number

  constructor(options: OpenAICompatibleOptions) {
    this.name = options.id
    this.model = options.model
    this.baseURL = options.baseURL.replace(/\/+$/, "")
    this.apiKey = options.apiKey
    this.extraHeaders = options.extraHeaders ?? {}
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...this.extraHeaders,
    }
  }

  private async post(
    body: Record<string, unknown>,
    signal: AbortSignal
  ): Promise<Response> {
    let res: Response
    try {
      res = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ model: this.model, ...body }),
        signal,
      })
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new LLMRequestError(this.name, `Request timed out after ${this.timeoutMs}ms`)
      }
      throw new LLMRequestError(
        this.name,
        err instanceof Error ? err.message : "Network request failed"
      )
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      throw new LLMRequestError(
        this.name,
        `${this.name} API error (${res.status}): ${detail.slice(0, 500)}`,
        res.status
      )
    }

    return res
  }

  async generateText(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const messages: ChatMessage[] = [{ role: "user", content: prompt }]
      const res = await this.post({ messages }, controller.signal)
      const data = await readJsonBody(res, this.name)
      return readChoiceContent(data, "message")
    } finally {
      clearTimeout(timer)
    }
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    const controller = new AbortController()
    const messages: ChatMessage[] = [{ role: "user", content: prompt }]
    const res = await this.post({ messages, stream: true }, controller.signal)

    const reader = res.body?.getReader()
    if (!reader) {
      throw new LLMRequestError(this.name, "Stream response has no body")
    }

    const decoder = new TextDecoder()

    return new ReadableStream({
      async start(streamController) {
        let buffer = ""
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith("data:")) continue
              const payload = trimmed.slice(5).trim()
              if (!payload || payload === "[DONE]") continue

              try {
                const parsed = JSON.parse(payload)
                const content = readChoiceContent(parsed, "delta")
                if (content) {
                  streamController.enqueue(new TextEncoder().encode(content))
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
          streamController.close()
        } catch (err) {
          streamController.error(err)
        }
      },
      cancel() {
        controller.abort()
      },
    })
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const messages: ChatMessage[] = [{ role: "user", content: prompt }]

    // Prefer native JSON mode, but some upstream models reject response_format.
    const attempts: Array<Record<string, unknown>> = [
      { messages, response_format: { type: "json_object" } },
      { messages },
    ]

    let lastError: unknown
    for (const body of attempts) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), this.timeoutMs)
      try {
        const res = await this.post(body, controller.signal)
        const data = await readJsonBody(res, this.name)
        const text = readChoiceContent(data, "message")
        return parseJsonLoose<T>(text)
      } catch (err) {
        lastError = err
        // Only fall back to the no-format attempt for client-side rejections.
        if (
          !(err instanceof LLMRequestError) ||
          err.status === undefined ||
          err.status < 400 ||
          err.status >= 500
        ) {
          break
        }
      } finally {
        clearTimeout(timer)
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new LLMRequestError(this.name, "JSON generation failed")
  }
}
