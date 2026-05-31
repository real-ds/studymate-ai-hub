import { PDFParse } from "pdf-parse"
import { fetchFile } from "@/lib/storage/blob"

export async function parsePDF(fileUrl: string): Promise<string> {
  const buffer = await fetchFile(fileUrl)
  const parser = new PDFParse({ data: buffer })
  const textResult = await parser.getText()
  const text = textResult.pages.map((p: { text: string }) => p.text).join("\n\n")
  return text
}
