import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"

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

    return Response.json(
      records.map((r) => ({
        id: r.id,
        originalName: r.originalName,
        feature: r.feature,
        status: r.status,
        createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
        fileType: r.fileType,
      })),
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    )
  } catch (error) {
    console.error("GET /api/history error:", error)
    return Response.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
