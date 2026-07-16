import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { sessionsOutput } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const [output] = await db
      .select({
        id: sessionsOutput.id,
        pdfUrl: sessionsOutput.pdfUrl,
      })
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

    return Response.json({
      pdfReady: !!output.pdfUrl,
      pdfUrl: output.pdfUrl,
    })
  } catch (error) {
    console.error("GET /api/sessions/[id]/status error:", error)
    return Response.json({ error: "Failed to check session status" }, { status: 500 })
  }
}
