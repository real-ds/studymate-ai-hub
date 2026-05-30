import sharp from "sharp"

export async function parseImage(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const resized = await sharp(buffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const base64 = resized.toString("base64")
  return `data:image/jpeg;base64,${base64}`
}
