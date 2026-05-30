import mammoth from "mammoth"

export async function parseDOCX(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) throw new Error(`Failed to fetch DOCX: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}
