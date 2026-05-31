import mammoth from "mammoth"
import { fetchFile } from "@/lib/storage/blob"

export async function parseDOCX(fileUrl: string): Promise<string> {
  const buffer = await fetchFile(fileUrl)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}
