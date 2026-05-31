import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { fetchFile } from "@/lib/storage/blob"

export const dynamic = "force-dynamic"

function getMimeType(fileName: string, fileType: string): string {
  const ext = "." + fileName.split(".").pop()?.toLowerCase()
  switch (ext) {
    case ".pdf":
      return "application/pdf"
    case ".pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    case ".doc":
      return "application/msword"
    case ".txt":
      return "text/plain"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".webp":
      return "image/webp"
    default:
      switch (fileType) {
        case "pdf":
          return "application/pdf"
        case "pptx":
          return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        case "docx":
          return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        case "txt":
          return "text/plain"
        case "image":
          return "image/png"
        default:
          return "application/octet-stream"
      }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const download = searchParams.get("download") === "true"

    const record = await db
      .select()
      .from(fileRecords)
      .where(
        and(
          eq(fileRecords.id, id),
          eq(fileRecords.userId, session.user.id)
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!record) {
      return Response.json({ error: "File not found" }, { status: 404 })
    }

    const buffer = await fetchFile(record.fileUrl)
    const mimeType = getMimeType(record.originalName, record.fileType)

    const headers = new Headers()
    headers.set("Content-Type", download ? "application/octet-stream" : mimeType)
    
    const encodedName = encodeURIComponent(record.originalName)
    const disposition = download ? "attachment" : "inline"
    headers.set(
      "Content-Disposition", 
      `${disposition}; filename*=UTF-8''${encodedName}; filename="${record.originalName}"`
    )

    return new Response(new Uint8Array(buffer), {
      headers,
    })
  } catch (error) {
    console.error("GET /api/history/[id]/file error:", error)
    return Response.json({ error: "Failed to download/view file" }, { status: 500 })
  }
}
