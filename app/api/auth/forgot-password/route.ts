import { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { generateOtp, getOtpExpiry, sendOtpEmail } from "@/lib/email"

const bodySchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0] ?? null)

    if (user) {
      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))

      const otp = generateOtp()
      const expires = getOtpExpiry()

      await db.insert(verificationTokens).values({
        identifier: email,
        token: otp,
        expires,
      })

      await sendOtpEmail(email, otp)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 })
  }
}
