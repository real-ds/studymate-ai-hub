import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput } from "@/lib/db/schema"
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

    const result = await db
      .select({
        session: sessionsOutput,
        fileRecord: fileRecords,
      })
      .from(sessionsOutput)
      .leftJoin(
        fileRecords,
        eq(sessionsOutput.fileRecordId, fileRecords.id)
      )
      .where(
        and(
          eq(sessionsOutput.id, id),
          eq(sessionsOutput.userId, session.user.id)
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!result) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json({
      id: result.session.id,
      fileRecordId: result.session.fileRecordId,
      userId: result.session.userId,
      feature: result.session.feature,
      outputJson: result.session.outputJson,
      outputText: result.session.outputText,
      pdfUrl: result.session.pdfUrl,
      createdAt: result.session.createdAt?.toISOString() ?? new Date().toISOString(),
      fileRecord: result.fileRecord
        ? {
            originalName: result.fileRecord.originalName,
            fileUrl: result.fileRecord.fileUrl,
            fileType: result.fileRecord.fileType,
            feature: result.fileRecord.feature,
            status: result.fileRecord.status,
          }
        : null,
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    })
  } catch (error) {
    console.error("GET /api/history/[id] error:", error)
    return Response.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await db
      .select()
      .from(sessionsOutput)
      .where(
        and(
          eq(sessionsOutput.id, id),
          eq(sessionsOutput.userId, session.user.id)
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!existing) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    if (existing.fileRecordId) {
      await db
        .delete(fileRecords)
        .where(
          and(
            eq(fileRecords.id, existing.fileRecordId),
            eq(fileRecords.userId, session.user.id)
          )
        )
    }

    await db
      .delete(sessionsOutput)
      .where(
        and(
          eq(sessionsOutput.id, id),
          eq(sessionsOutput.userId, session.user.id)
        )
      )

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/history/[id] error:", error)
    return Response.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
