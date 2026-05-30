import { PDFParse } from "pdf-parse"

export async function parsePDF(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  const parser = new PDFParse({ data: arrayBuffer })
  const textResult = await parser.getText()
  const text = textResult.pages.map((p: { text: string }) => p.text).join("\n\n")
  return text
}
