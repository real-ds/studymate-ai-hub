export function getRevisionPrompt(text: string): string {
  return `You are a study assistant. Create a dense, exam-focused cheat sheet from the content below. Max 600 words. Prioritize: definitions, key facts, formulas, important dates/events, and summary bullets. Use markdown with ## headings, **bold** terms, and --- separators.

Content:
${text}`
}
