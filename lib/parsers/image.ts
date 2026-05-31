import sharp from "sharp"
import { fetchFile } from "@/lib/storage/blob"

export async function parseImage(fileUrl: string): Promise<string> {
  const buffer = await fetchFile(fileUrl)

  const resized = await sharp(buffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const base64 = resized.toString("base64")
  return `data:image/jpeg;base64,${base64}`
}
