export function getFlashcardsPrompt(
  text: string,
  count: number = 10
): string {
  return `You are a study tool. Generate ${count} flashcards from the content below. Return ONLY a valid JSON array of objects with "front" and "back" keys. No preamble, no markdown fences.

Content:
${text}`
}
