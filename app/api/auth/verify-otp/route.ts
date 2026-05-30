import { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { verificationTokens } from "@/lib/db/schema"
import { eq, and, gt } from "drizzle-orm"
import { generateResetToken } from "@/lib/auth/reset-token"

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
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

    const { email, otp } = parsed.data

    const stored = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp),
          gt(verificationTokens.expires, new Date())
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!stored) {
      return Response.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp)
        )
      )

    const resetToken = generateResetToken(email)

    return Response.json({ success: true, resetToken })
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}
