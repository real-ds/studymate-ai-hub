import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { apiKeys } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

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
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
      .then((rows) => rows[0] ?? null)

    if (!existing) {
      return Response.json({ error: "API key not found" }, { status: 404 })
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, id))

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/profile/api-keys/[id] error:", error)
    return Response.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}
