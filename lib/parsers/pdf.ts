import { fetchFile } from "@/lib/storage/blob"

export async function parsePDF(fileUrl: string): Promise<string> {
  if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {}
  }

  await import("pdf-parse/worker")
  const { PDFParse } = await import("pdf-parse")

  const buffer = await fetchFile(fileUrl)
  const parser = new PDFParse({ data: buffer })
  const textResult = await parser.getText()
  const text = textResult.pages.map((p: { text: string }) => p.text).join("\n\n")
  return text
}
