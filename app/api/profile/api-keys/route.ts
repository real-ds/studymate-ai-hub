import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { apiKeys } from "@/lib/db/schema"
import { encryptApiKey } from "@/lib/crypto/api-key"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const dynamic = "force-dynamic"

const addKeySchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  key: z.string().min(1, "API key is required"),
  label: z.string().optional(),
})

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****"
  return key.slice(0, 4) + "..." + key.slice(-4)
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id))
      .orderBy(apiKeys.createdAt)

    const masked = keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      label: k.label,
      isActive: k.isActive,
      createdAt: k.createdAt?.toISOString() ?? new Date().toISOString(),
      keyPreview: maskApiKey(k.encryptedKey),
    }))

    return Response.json(masked, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    })
  } catch (error) {
    console.error("GET /api/profile/api-keys error:", error)
    return Response.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addKeySchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      )
    }

    const { provider, key, label } = parsed.data
    const encryptedKey = encryptApiKey(key)

    const [record] = await db
      .insert(apiKeys)
      .values({
        userId: session.user.id,
        provider,
        encryptedKey,
        label: label ?? null,
        isActive: true,
      })
      .returning()

    return Response.json({
      id: record.id,
      provider: record.provider,
      label: record.label,
      isActive: record.isActive,
      createdAt: record.createdAt?.toISOString() ?? new Date().toISOString(),
      keyPreview: maskApiKey(encryptedKey),
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/profile/api-keys error:", error)
    return Response.json({ error: "Failed to save API key" }, { status: 500 })
  }
}
