import type { LLMProvider } from "./provider"

const HF_API_BASE = "https://api-inference.huggingface.co/models"

export class HuggingFaceProvider implements LLMProvider {
  readonly name = "HuggingFace"
  private apiToken: string
  private model: string

  constructor(model = "meta-llama/Meta-Llama-3-8B-Instruct") {
    const token = process.env.HF_API_TOKEN
    if (!token) {
      throw new Error("HF_API_TOKEN environment variable is not set")
    }
    this.apiToken = token
    this.model = model
  }

  async generateText(prompt: string): Promise<string> {
    const res = await fetch(`${HF_API_BASE}/${this.model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048 },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HuggingFace API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    if (Array.isArray(data)) {
      return data[0]?.generated_text?.slice(prompt.length)?.trim() ?? ""
    }
    return (data.generated_text?.slice(prompt.length)?.trim()) ?? ""
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    const res = await fetch(`${HF_API_BASE}/${this.model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048 },
        stream: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HuggingFace API error (${res.status}): ${err}`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error("HuggingFace stream response has no body")

    const decoder = new TextDecoder()

    return new ReadableStream({
      async start(controller) {
        try {
          let buffer = ""
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const parts = buffer.split("\n")
            buffer = parts.pop() ?? ""

            for (const part of parts) {
              if (!part.trim()) continue
              try {
                const parsed = JSON.parse(part)
                const token = parsed[0]?.generated_text ?? parsed.generated_text ?? ""
                if (token) {
                  controller.enqueue(new TextEncoder().encode(token))
                }
              } catch {
                const dataPart = part.replace(/^data:\s*/, "")
                if (dataPart === "[DONE]") continue
                try {
                  const parsed = JSON.parse(dataPart)
                  const token = parsed.token?.text ?? ""
                  if (token) {
                    controller.enqueue(new TextEncoder().encode(token))
                  }
                } catch {
                  // skip malformed lines
                }
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
    const res = await fetch(`${HF_API_BASE}/${this.model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048 },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HuggingFace API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    let text = ""
    if (Array.isArray(data)) {
      text = data[0]?.generated_text?.slice(prompt.length)?.trim() ?? ""
    } else {
      text = (data.generated_text?.slice(prompt.length)?.trim()) ?? ""
    }

    const cleaned = text.replace(/```(?:json)?\s*/g, "").trim()
    return JSON.parse(cleaned) as T
  }
}
