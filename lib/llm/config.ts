import { OpenAICompatibleProvider } from "./openai-compatible"
import type { LLMProvider } from "./provider"

export interface ProviderConfig {
  id: string
  baseURL: string
  apiKey: string
  models: string[]
  extraHeaders?: Record<string, string>
}

const DEFAULT_XKIRO_BASE_URL = "https://api.xkiro.com/v1"
const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

// Free-tier friendly models only. All IDs verified against each provider's catalog.
const DEFAULT_XKIRO_MODELS = [
  "qwen/qwen3.8-max:free",     // Pool index 0 → final pos 2
  "qwen/qwen3.7-max:free",     // Pool index 1 → final pos 4
  "qwen/qwen3.7-flash:free",   // Pool index 2 → final pos 6
  "mistralai/mistral-medium-3.5",   // Pool index 3 → final pos 9
  "qwen3.6-plus:free",         // Pool index 4 → final pos 10
  "mistralai/mistral-small-2603",   // Pool index 5 → final pos 11
]

const DEFAULT_OPENROUTER_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",   // Pool index 0 → final pos 1
  "cohere/north-mini-code:free",              // Pool index 1 → final pos 5
  "mistralai/mistral-large-2512",             // Pool index 2 → final pos 7
  "google/gemma-4-31b-it:free",               // Pool index 3 → final pos 8
]

const DEFAULT_NVIDIA_MODELS = [
  "nvidia/nemotron-3.5-lightning-30b-a3b",   // Pool index 0 → final pos 0
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", // Pool index 1 → final pos 3
]

function splitList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function modelsFromEnv(raw: string | undefined, fallback: string[]): string[] {
  const parsed = splitList(raw)
  return parsed.length > 0 ? parsed : fallback
}

function openRouterAttribution(): Record<string, string> {
  const site =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    ""
  const headers: Record<string, string> = { "X-Title": "StudyMate AI Hub" }
  if (site) headers["HTTP-Referer"] = site
  return headers
}

/**
 * Reads provider configuration from environment variables. A provider is only
 * included when its API key is present, so keys stay server-side (env / Vercel)
 * and inactive providers are silently skipped.
 *
 * Provider order determines round-robin interleaving:
 *   nvidia[0], openrouter[0], xkiro[0], nvidia[1], openrouter[1], xkiro[1], ...
 */
export function getProviderConfigs(): ProviderConfig[] {
  const configs: ProviderConfig[] = []

  const nvidiaKey = process.env.NVIDIA_API_KEY
  if (nvidiaKey) {
    configs.push({
      id: "nvidia",
      baseURL: process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_BASE_URL,
      apiKey: nvidiaKey,
      models: modelsFromEnv(process.env.NVIDIA_MODELS, DEFAULT_NVIDIA_MODELS),
    })
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (openRouterKey) {
    configs.push({
      id: "openrouter",
      baseURL: process.env.OPENROUTER_BASE_URL || DEFAULT_OPENROUTER_BASE_URL,
      apiKey: openRouterKey,
      models: modelsFromEnv(process.env.OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODELS),
      extraHeaders: openRouterAttribution(),
    })
  }

  const xkiroKey = process.env.XKIRO_API_KEY
  if (xkiroKey) {
    configs.push({
      id: "xkiro",
      baseURL: process.env.XKIRO_BASE_URL || DEFAULT_XKIRO_BASE_URL,
      apiKey: xkiroKey,
      models: modelsFromEnv(process.env.XKIRO_MODELS, DEFAULT_XKIRO_MODELS),
    })
  }

  return configs
}

/**
 * Builds the endpoint pool by interleaving providers, so a full round of the
 * cursor spreads requests across every provider before repeating one:
 *   xkiro[0], openrouter[0], nvidia[0], xkiro[1], openrouter[1], ...
 * This prevents a single key/model/provider from being exhausted first.
 */
export function buildEndpointPool(configs: ProviderConfig[]): LLMProvider[] {
  const pool: LLMProvider[] = []
  if (configs.length === 0) return pool

  const maxModels = configs.reduce((max, c) => Math.max(max, c.models.length), 0)

  for (let i = 0; i < maxModels; i++) {
    for (const config of configs) {
      const model = config.models[i]
      if (!model) continue

      pool.push(
        new OpenAICompatibleProvider({
          id: `${config.id}:${model}`,
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          model,
          extraHeaders: config.extraHeaders,
        })
      )
    }
  }

  return pool
}
