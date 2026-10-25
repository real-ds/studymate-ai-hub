export interface LLMProvider {
  readonly name: string
  readonly modelId?: string
  generateText(prompt: string): Promise<string>
  generateStream(prompt: string): Promise<ReadableStream>
  generateJSON<T>(prompt: string): Promise<T>
}
