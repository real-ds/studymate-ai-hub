import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput, apiKeys } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { extractTextFromFile } from "@/lib/parsers"
import { getRevisionPrompt } from "@/lib/llm/prompts/revision"
import { GeminiProvider } from "@/lib/llm/gemini"
import { decrypt } from "@/lib/crypto/api-key"

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

    const prompt = getRevisionPrompt(extractedText)
    const gemini = new GeminiProvider(apiKey)

    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    let fullText = ""

    ;(async () => {
      try {
        const geminiStream = await gemini.generateStream(prompt)
        const reader = geminiStream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          fullText += text
          await writer.write(encoder.encode(text))
        }

        await writer.close()

        await db.insert(sessionsOutput).values({
          fileRecordId,
          userId,
          feature: "revision",
          outputText: fullText,
        })

        await db
          .update(fileRecords)
          .set({ status: "done" })
          .where(eq(fileRecords.id, fileRecordId))
      } catch {
        try { await writer.abort() } catch {}
        await db
          .update(fileRecords)
          .set({ status: "failed", errorMessage: "Generation failed" })
          .where(eq(fileRecords.id, fileRecordId))
      }
    })()

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Revision API error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate revision notes"
    return Response.json({ error: message }, { status: 500 })
  }
}
