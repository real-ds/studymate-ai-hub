import type { LLMProvider } from "./provider"

const GROQ_API_BASE = "https://api.groq.com/openai/v1"

export class GroqProvider implements LLMProvider {
  readonly name = "Groq"
  private apiKey: string
  private model: string

  constructor(model = "llama-3.3-70b-versatile") {
    const key = process.env.GROQ_API_KEY
    if (!key) {
      throw new Error("GROQ_API_KEY environment variable is not set")
    }
    this.apiKey = key
    this.model = model
  }

  async generateText(prompt: string): Promise<string> {
    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content as string
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error("Groq stream response has no body")

    const decoder = new TextDecoder()

    return new ReadableStream({
      async start(controller) {
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
              if (!trimmed || !trimmed.startsWith("data: ")) continue
              const payload = trimmed.slice(6)
              if (payload === "[DONE]") return

              try {
                const parsed = JSON.parse(payload)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content))
                }
              } catch {
                // skip malformed JSON lines
              }
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    const text = data.choices[0].message.content as string
    const cleaned = text.replace(/```(?:json)?\s*/g, "").trim()
    return JSON.parse(cleaned) as T
  }
}
