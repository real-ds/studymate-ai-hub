import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput, apiKeys } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { extractTextFromFile } from "@/lib/parsers"
import { getFlashcardsPrompt } from "@/lib/llm/prompts/flashcards"
import { GeminiProvider } from "@/lib/llm/gemini"
import { decrypt } from "@/lib/crypto/api-key"
import type { Flashcard } from "@/types/feature.types"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const fileRecordId: string = body.fileRecordId
    if (!fileRecordId) {
      return Response.json({ error: "fileRecordId is required" }, { status: 400 })
    }

    const count = Math.min(Math.max(body.options?.count || 10, 10), 50)

    const [record] = await db
      .select()
      .from(fileRecords)
      .where(
        and(eq(fileRecords.id, fileRecordId), eq(fileRecords.userId, userId))
      )

    if (!record) {
      return Response.json({ error: "File record not found" }, { status: 404 })
    }

    await db
      .update(fileRecords)
      .set({ status: "processing" })
      .where(eq(fileRecords.id, fileRecordId))

    const [apiKeyRow] = await db
      .select()
      .from(apiKeys)
      .where(
        and(eq(apiKeys.userId, userId), eq(apiKeys.provider, "gemini"), eq(apiKeys.isActive, true))
      )

    if (!apiKeyRow) {
      await db
        .update(fileRecords)
        .set({ status: "failed", errorMessage: "Please add your Gemini API key in Profile" })
        .where(eq(fileRecords.id, fileRecordId))
      return Response.json({ error: "Please add your Gemini API key in Profile" }, { status: 400 })
    }

    const apiKey = decrypt(apiKeyRow.encryptedKey)

    let extractedText: string
    try {
      extractedText = await extractTextFromFile(record.fileUrl, record.fileType)
    } catch (extractErr) {
      const extractMsg = extractErr instanceof Error ? extractErr.message : "Failed to extract text from file"
      console.error("Extract text error:", extractMsg)
      await db
        .update(fileRecords)
        .set({ status: "failed", errorMessage: extractMsg })
        .where(eq(fileRecords.id, fileRecordId))
      return Response.json({ error: extractMsg }, { status: 500 })
    }

    const prompt = getFlashcardsPrompt(extractedText, count)
    const gemini = new GeminiProvider(apiKey)
    const flashcards = await gemini.generateJSON<Flashcard[]>(prompt)

    await db.insert(sessionsOutput).values({
      fileRecordId,
      userId,
      feature: "flashcards",
      outputJson: flashcards as unknown as Record<string, unknown>,
    })

    await db
      .update(fileRecords)
      .set({ status: "done" })
      .where(eq(fileRecords.id, fileRecordId))

    return Response.json({ flashcards })
  } catch (error) {
    console.error("Flashcards API error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate flashcards"
    return Response.json({ error: message }, { status: 500 })
  }
}
