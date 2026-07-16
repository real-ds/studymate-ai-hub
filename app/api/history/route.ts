import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput } from "@/lib/db/schema"
import { eq, and, desc, inArray } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get("feature")

    const conditions = [eq(fileRecords.userId, session.user.id)]
    if (feature) {
      conditions.push(eq(fileRecords.feature, feature))
    }

    const records = await db
      .select()
      .from(fileRecords)
      .where(and(...conditions))
      .orderBy(desc(fileRecords.createdAt))

    // Batch-fetch latest session for each file record to get generated PDF URLs
    const fileRecordIds = records.map((r) => r.id)
    const latestSessions: { id: string; fileRecordId: string; pdfUrl: string | null }[] = []
    if (fileRecordIds.length > 0) {
      const sessions = await db
        .select({
          id: sessionsOutput.id,
          fileRecordId: sessionsOutput.fileRecordId,
          pdfUrl: sessionsOutput.pdfUrl,
        })
        .from(sessionsOutput)
        .where(inArray(sessionsOutput.fileRecordId, fileRecordIds))
        .orderBy(desc(sessionsOutput.createdAt))

      const seen = new Set<string>()
      for (const s of sessions) {
        if (s.fileRecordId && !seen.has(s.fileRecordId)) {
          seen.add(s.fileRecordId)
          latestSessions.push(s as { id: string; fileRecordId: string; pdfUrl: string | null })
        }
      }
    }

    const sessionMap = new Map(latestSessions.map((s) => [s.fileRecordId, s]))

    return Response.json(
      records.map((r) => {
        const latest = sessionMap.get(r.id)
        return {
          id: r.id,
          originalName: r.originalName,
          feature: r.feature,
          status: r.status,
          createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
          fileType: r.fileType,
          fileUrl: r.fileUrl,
          sessionId: latest?.id ?? null,
          pdfUrl: latest?.pdfUrl ?? null,
        }
      }),
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    )
  } catch (error) {
    console.error("GET /api/history error:", error)
    return Response.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
