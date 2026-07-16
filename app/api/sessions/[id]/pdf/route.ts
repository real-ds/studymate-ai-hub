import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { sessionsOutput, fileStorage } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

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

    const [output] = await db
      .select()
      .from(sessionsOutput)
      .where(
        and(
          eq(sessionsOutput.id, id),
          eq(sessionsOutput.userId, session.user.id)
        )
      )

    if (!output) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    if (!output.pdfUrl) {
      return Response.json({ error: "No PDF available for this session" }, { status: 404 })
    }

    if (!output.pdfUrl.startsWith("db://")) {
      return Response.redirect(output.pdfUrl)
    }

    const storageId = output.pdfUrl.slice(5)
    const [storage] = await db
      .select()
      .from(fileStorage)
      .where(eq(fileStorage.id, storageId))

    if (!storage) {
      return Response.json({ error: "PDF data not found" }, { status: 404 })
    }

    const buffer = Buffer.from(storage.data, "base64")

    const headers = new Headers()
    headers.set("Content-Type", download ? "application/octet-stream" : "application/pdf")

    const filename = `${output.feature}-output.pdf`
    const encodedName = encodeURIComponent(filename)
    const disposition = download ? "attachment" : "inline"
    headers.set(
      "Content-Disposition",
      `${disposition}; filename*=UTF-8''${encodedName}; filename="${filename}"`
    )

    return new Response(new Uint8Array(buffer), { headers })
  } catch (error) {
    console.error("GET /api/sessions/[id]/pdf error:", error)
    return Response.json({ error: "Failed to serve PDF" }, { status: 500 })
  }
}
