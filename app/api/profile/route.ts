import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { users, fileRecords, sessionsOutput } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((rows) => rows[0] ?? null)

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const [fileCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(fileRecords)
      .where(eq(fileRecords.userId, session.user.id))

    const [outputCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessionsOutput)
      .where(eq(sessionsOutput.userId, session.user.id))

    const fileCount = fileCountResult?.count ?? 0
    const outputCount = outputCountResult?.count ?? 0

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
      stats: {
        filesProcessed: fileCount,
        outputsGenerated: outputCount,
      },
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    })
  } catch (error) {
    console.error("GET /api/profile error:", error)
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      )
    }

    const updates: Record<string, string | Date> = {}
    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.image !== undefined) updates.image = parsed.data.image

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 })
    }

    updates.updatedAt = new Date()

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))
      .returning()

    return Response.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
    })
  } catch (error) {
    console.error("PATCH /api/profile error:", error)
    return Response.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
