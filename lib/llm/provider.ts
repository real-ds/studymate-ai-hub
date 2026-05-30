export interface LLMProvider {
  generateText(prompt: string): Promise<string>
  generateStream(prompt: string): Promise<ReadableStream>
  generateJSON<T>(prompt: string): Promise<T>
}
