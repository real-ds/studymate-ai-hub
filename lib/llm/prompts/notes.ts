export function getNotesPrompt(
  text: string,
  mode: "compact" | "detailed" = "detailed"
): string {
  return `You are an expert academic note-taker. Convert the following content into ${mode} structured notes with clear headings, sub-points, definitions, and key callouts. Use markdown formatting with ## for headings, **bold** for key terms, and > for callout boxes.

Content:
${text}`
}
