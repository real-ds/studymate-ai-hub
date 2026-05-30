export function getQuizPrompt(
  text: string,
  count: number = 10,
  difficulty: string = "medium"
): string {
  return `Generate ${count} ${difficulty} difficulty multiple choice questions. Return ONLY a valid JSON array of objects with "question", "options" (array of 4 strings), "correct" (the correct option letter A-D), and "explanation" keys. No preamble, no markdown fences.

Content:
${text}`
}
