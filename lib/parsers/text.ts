import { fetchFile } from "@/lib/storage/blob"

export async function parseTXT(fileUrl: string): Promise<string> {
  const buffer = await fetchFile(fileUrl)
  return buffer.toString("utf-8")
}
