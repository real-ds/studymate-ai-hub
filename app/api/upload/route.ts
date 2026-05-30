import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage/blob"

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
]

const ALLOWED_EXTENSIONS = [
  ".pdf", ".pptx", ".docx", ".doc", ".txt",
  ".jpg", ".jpeg", ".png", ".webp",
]

const MAX_FILE_SIZE = 25 * 1024 * 1024

function getFileType(mimeType: string, fileName: string): string | null {
  const ext = "." + fileName.split(".").pop()?.toLowerCase()
  if (ext === ".pdf") return "pdf"
  if (ext === ".pptx") return "pptx"
  if (ext === ".docx" || ext === ".doc") return "docx"
  if (ext === ".txt") return "txt"
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image"
  return null
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const feature = formData.get("feature") as string | null

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    if (!feature) {
      return Response.json({ error: "No feature specified" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    )) {
      return Response.json(
        { error: "File type not supported. Allowed: pdf, pptx, docx, txt, jpg, jpeg, png, webp" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File exceeds 25MB limit" }, { status: 400 })
    }

    const fileType = getFileType(file.type, file.name)
    if (!fileType) {
      return Response.json({ error: "Could not determine file type" }, { status: 400 })
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`
    const { url } = await uploadFile(file, fileName)

    const [record] = await db
      .insert(fileRecords)
      .values({
        userId: session.user.id,
        originalName: file.name,
        fileUrl: url,
        fileType,
        fileSize: file.size,
        feature,
        status: "pending",
      })
      .returning()

    return Response.json({ fileRecordId: record.id, fileUrl: url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    console.error("Upload error:", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
