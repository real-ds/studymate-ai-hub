export function getMindMapPrompt(text: string): string {
  return `Create a hierarchical mind map from the content below. Return ONLY a valid JSON tree with "id", "label", "children" (array of nested nodes), and optionally "detail" keys. Max 3 levels deep. No preamble, no markdown fences.

Content:
${text}`
}
