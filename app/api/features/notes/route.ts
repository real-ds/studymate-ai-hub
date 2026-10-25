import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { extractTextFromFile } from "@/lib/parsers"
import { getNotesPrompt } from "@/lib/llm/prompts/notes"
import { llm } from "@/lib/llm/registry"
import { getGeminiVisionModel } from "@/lib/llm/gemini"
import { LLMErrorType, LLMRequestError } from "@/lib/llm/errors"

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

    const mode = body.options?.mode || "detailed"

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

    if (record.fileType === "image") {
      try {
        const visionModel = getGeminiVisionModel()
        const base64Data = extractedText.replace("IMAGE_CONTENT:", "")
        const visionPrompt = "Extract all text from this image and format it as readable content with proper structure."
        const result = await visionModel.generateContent([
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: visionPrompt },
        ])
        extractedText = result.response.text()
      } catch {
        await db
          .update(fileRecords)
          .set({ status: "failed", errorMessage: "Failed to process image with Vision API" })
          .where(eq(fileRecords.id, fileRecordId))
        return Response.json({ error: "Failed to process image" }, { status: 500 })
      }
    }

    const prompt = getNotesPrompt(extractedText, mode)

    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    let fullText = ""

    ;(async () => {
      try {
        const stream = await llm.generateStream(prompt)
        const reader = stream.getReader()
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
          feature: "notes",
          outputText: fullText,
        })

        await db
          .update(fileRecords)
          .set({ status: "done" })
          .where(eq(fileRecords.id, fileRecordId))
      } catch (streamError) {
        console.error("Notes stream error:", streamError)
        try { await writer.abort() } catch {}
        await db
          .update(fileRecords)
          .set({ status: "failed", errorMessage: streamError instanceof Error ? streamError.message : "Generation failed" })
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
    console.error("Notes API error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate notes"
    // Include model ID and error type if available
    let enhancedMessage = message
    if (error instanceof LLMRequestError) {
      const typedError = error
      const typePrefix = typedError.errorType === LLMErrorType.RATE_LIMIT ? 'Rate limited' : typedError.errorType === LLMErrorType.UNAVAILABLE ? 'Unavailable' : ''
      enhancedMessage = `${typePrefix}: ${message} (model: ${typedError.modelId})`
    }
    return Response.json({ error: enhancedMessage }, { status: 500 })
  }
}
