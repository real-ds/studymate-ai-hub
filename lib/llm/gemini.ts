import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"
import type { LLMProvider } from "./provider"
import { parseJsonLoose } from "./openai-compatible"
import { toLLMError } from "./errors"

const DEFAULT_MODEL = "gemini-3.5-flash"

export class GeminiProvider implements LLMProvider {
  readonly name = "Gemini"
  readonly modelId: string
  private model: GenerativeModel

  constructor(apiKey: string, modelId: string = DEFAULT_MODEL, systemPrompt?: string) {
    const genAI = new GoogleGenerativeAI(apiKey)
    this.modelId = modelId
    this.model = genAI.getGenerativeModel({
      model: modelId,
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    })
  }

  /**
   * Builds the fallback provider from env. Returns null (inactive) when
   * GEMINI_API_KEY is not configured, so the pool simply skips it.
   */
  static fromEnv(): GeminiProvider | null {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return null
    return new GeminiProvider(apiKey, process.env.GEMINI_MODEL || DEFAULT_MODEL)
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (err) {
      throw toLLMError(this.name, err)
    }
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    let result: Awaited<ReturnType<GenerativeModel["generateContentStream"]>>
    try {
      result = await this.model.generateContentStream(prompt)
    } catch (err) {
      throw toLLMError(this.name, err)
    }

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        } catch (err) {
          controller.error(toLLMError("Gemini", err))
        }
      },
    })
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    try {
      const result = await this.model.generateContent(prompt)
      return parseJsonLoose<T>(result.response.text())
    } catch (err) {
      throw toLLMError(this.name, err)
    }
  }
}

export function getGeminiVisionModel(apiKey: string, modelId: string = DEFAULT_MODEL) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: modelId })
}
