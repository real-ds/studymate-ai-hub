import { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { verifyResetToken } from "@/lib/auth/reset-token"

const bodySchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    const payload = verifyResetToken(token)
    if (!payload) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .then((rows) => rows[0] ?? null)

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.passwordHash) {
      return Response.json(
        { error: "This account uses OAuth and cannot reset its password here" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    return Response.json({ success: true })
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error)
    return Response.json({ error: "Password reset failed" }, { status: 500 })
  }
}
