import type { LLMProvider } from "./provider"
import { GroqProvider } from "./groq"
import { HuggingFaceProvider } from "./huggingface"

type ProviderFactory = () => LLMProvider

export class ProviderRegistry {
  private factories: ProviderFactory[] = []

  constructor() {
    this.register(() => new GroqProvider())
    this.register(() => new HuggingFaceProvider())
  }

  register(factory: ProviderFactory): void {
    this.factories.push(factory)
  }

  private instantiateProviders(): LLMProvider[] {
    const providers: LLMProvider[] = []
    for (const factory of this.factories) {
      try {
        const provider = factory()
        providers.push(provider)
      } catch {
        // provider threw (e.g. missing env var), skip it
      }
    }
    return providers
  }

  async generateText(prompt: string): Promise<string> {
    const providers = this.instantiateProviders()
    if (providers.length === 0) {
      throw new Error("No LLM providers available. Configure GROQ_API_KEY or HF_API_TOKEN.")
    }
    const errors: { provider: string; error: unknown }[] = []

    for (const provider of providers) {
      try {
        return await provider.generateText(prompt)
      } catch (err) {
        console.warn(`${provider.name} failed, trying next provider:`, err)
        errors.push({ provider: provider.name, error: err })
      }
    }

    throw new Error(
      `All providers failed. Errors:\n${errors.map((e) => `  ${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join("\n")}`
    )
  }

  async generateStream(prompt: string): Promise<ReadableStream> {
    const providers = this.instantiateProviders()
    if (providers.length === 0) {
      throw new Error("No LLM providers available. Configure GROQ_API_KEY or HF_API_TOKEN.")
    }
    const errors: { provider: string; error: unknown }[] = []

    for (const provider of providers) {
      try {
        return await provider.generateStream(prompt)
      } catch (err) {
        console.warn(`${provider.name} stream failed, trying next provider:`, err)
        errors.push({ provider: provider.name, error: err })
      }
    }

    throw new Error(
      `All providers failed.\n${errors.map((e) => `  ${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join("\n")}`
    )
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const providers = this.instantiateProviders()
    if (providers.length === 0) {
      throw new Error("No LLM providers available. Configure GROQ_API_KEY or HF_API_TOKEN.")
    }
    const errors: { provider: string; error: unknown }[] = []

    for (const provider of providers) {
      try {
        return await provider.generateJSON<T>(prompt)
      } catch (err) {
        console.warn(`${provider.name} JSON generation failed, trying next provider:`, err)
        errors.push({ provider: provider.name, error: err })
      }
    }

    throw new Error(
      `All providers failed.\n${errors.map((e) => `  ${e.provider}: ${e.error instanceof Error ? e.error.message : String(e.error)}`).join("\n")}`
    )
  }
}

export const llm = new ProviderRegistry()
