import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0] ?? null)

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning()

    const user = newUser[0]

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("POST /api/auth/register error:", error)
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
