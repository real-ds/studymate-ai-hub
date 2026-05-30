import { parsePDF } from "./pdf"
import { parseDOCX } from "./docx"
import { parsePPTX } from "./pptx"
import { parseImage } from "./image"
import { parseTXT } from "./text"

export async function extractTextFromFile(
  fileUrl: string,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case "pdf":
      return parsePDF(fileUrl)
    case "docx":
      return parseDOCX(fileUrl)
    case "pptx":
      return parsePPTX(fileUrl)
    case "txt":
      return parseTXT(fileUrl)
    case "image":
      const imageData = await parseImage(fileUrl)
      return `IMAGE_CONTENT:${imageData}`
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}
