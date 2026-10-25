import type { LLMProvider } from "./provider"
import { buildEndpointPool, getProviderConfigs } from "./config"
import { GeminiProvider } from "./gemini"
import { isCoolingDown, markCooldown, nextIndex, shouldCooldown } from "./pool"
import { toLLMError, LLMErrorType, getErrorClass, LLMRequestError } from "./errors"

interface ProviderFailure {
  provider: string
  error: LLMRequestError
  modelId: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Round-robin registry across every configured (provider, model) endpoint.
 *
 * Each call starts at the next position of a shared cursor, so load is spread
 * across providers/models instead of exhausting one key. Endpoints that return
 * auth/rate-limit/server/network errors are parked in a cooldown window and
 * skipped. If the entire pool fails, Gemini (when GEMINI_API_KEY is set) is
 * used as the final fallback.
 */
export class RoundRobinRegistry {
  private async run<T>(
    method: string,
    invoke: (provider: LLMProvider) => Promise<T>
  ): Promise<T> {
    const providers = buildEndpointPool(getProviderConfigs())
    const failures: ProviderFailure[] = []

    if (providers.length > 0) {
      const start = await nextIndex(providers.length)

      for (let offset = 0; offset < providers.length; offset++) {
        const provider = providers[(start + offset) % providers.length]

        if (await isCoolingDown(provider.name)) continue

        try {
          return await invoke(provider)
        } catch (err) {
          const llmErr = toLLMError(provider.name, err, provider.modelId)
          if (shouldCooldown(llmErr)) await markCooldown(provider.name)
          console.warn(`[llm] ${method} via ${provider.name} failed: ${errorMessage(llmErr)}`)
          failures.push({ provider: provider.name, error: llmErr, modelId: llmErr.modelId })
          
          // Re-throw the first error to propagate modelId and errorType up
          if (failures.length === 1) throw llmErr
        }
      }
    }

    const gemini = GeminiProvider.fromEnv()
    if (gemini && !(await isCoolingDown(gemini.name))) {
      try {
        return await invoke(gemini)
      } catch (err) {
        const llmErr = toLLMError(gemini.name, err, gemini.modelId)
        if (shouldCooldown(llmErr)) await markCooldown(gemini.name)
        console.warn(`[llm] ${method} via Gemini fallback failed: ${errorMessage(llmErr)}`)
        failures.push({ provider: "Gemini", error: llmErr, modelId: llmErr.modelId })
        
        // Re-throw the first error to propagate modelId and errorType up
        if (failures.length === 1) throw llmErr
      }
    }

    // All providers failed - throw aggregated error with model info
    const detail =
      failures.length > 0
        ? failures.map((f) => `  ${f.provider} (${f.modelId || 'N/A'}): ${errorMessage(f.error)}`).join("\n")
        : "  no providers configured (set XKIRO_API_KEY / OPENROUTER_API_KEY / NVIDIA_API_KEY)"

    throw new Error(`All LLM providers failed for ${method}.\n${detail}`)
  }

  generateText(prompt: string): Promise<string> {
    return this.run("generateText", (provider) => provider.generateText(prompt))
  }

  generateStream(prompt: string): Promise<ReadableStream> {
    return this.run("generateStream", (provider) => provider.generateStream(prompt))
  }

  generateJSON<T>(prompt: string): Promise<T> {
    return this.run("generateJSON", (provider) => provider.generateJSON<T>(prompt))
  }
}

export const llm = new RoundRobinRegistry()
