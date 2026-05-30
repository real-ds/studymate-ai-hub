import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"
import type { LLMProvider } from "./provider"

export class GeminiProvider implements LLMProvider {
  private model: GenerativeModel

  constructor(apiKey: string, systemPrompt?: string) {
    const genAI = new GoogleGenerativeAI(apiKey)
    this.model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    })
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt)
    return result.response.text()
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    const result = await this.model.generateContentStream(prompt)
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      },
    })
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const result = await this.model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```(?:json)?\s*/g, "").trim()
    return JSON.parse(cleaned) as T
  }
}

export function getGeminiVisionModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: "gemini-3.5-flash" })
}
