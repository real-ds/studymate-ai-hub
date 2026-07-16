import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput, fileStorage } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { extractTextFromFile } from "@/lib/parsers"
import { getNotesPrompt } from "@/lib/llm/prompts/notes"
import { llm } from "@/lib/llm/registry"
import { checkRateLimit } from "@/lib/rate-limiter"
import { pdf } from "@react-pdf/renderer"
import { NotesPDF } from "@/lib/pdf-templates"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResponse = await checkRateLimit(`llm:${userId}`, 20, 60)
    if (rateLimitResponse) return rateLimitResponse

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

        // Save session to DB (PDF not ready yet)
        const [outputRecord] = await db
          .insert(sessionsOutput)
          .values({
            fileRecordId,
            userId,
            feature: "notes",
            outputText: fullText,
          })
          .returning()

        // Send meta immediately so the client can close the stream
        const meta = JSON.stringify({ sessionId: outputRecord.id })
        await writer.write(encoder.encode(`\n__META__:${meta}\n`))
        await writer.close()

        // Mark file record as done
        await db
          .update(fileRecords)
          .set({ status: "done" })
          .where(eq(fileRecords.id, fileRecordId))

        // Generate PDF asynchronously in the background
        try {
          const doc = NotesPDF({ content: fullText })
          const pdfFn = pdf as unknown as (d: unknown) => { toBuffer: () => Promise<ReadableStream> }
          const pdfStream = await pdfFn(doc as unknown).toBuffer() as unknown as ReadableStream
          const pdfReader = pdfStream.getReader()
          const pdfChunks: Uint8Array[] = []
          while (true) {
            const { done, value } = await pdfReader.read()
            if (done) break
            pdfChunks.push(value)
          }
          const pdfBuffer = Buffer.concat(pdfChunks)
          const base64 = pdfBuffer.toString("base64")

          const [storageRecord] = await db
            .insert(fileStorage)
            .values({
              data: base64,
              mimeType: "application/pdf",
            })
            .returning()

          await db
            .update(sessionsOutput)
            .set({ pdfUrl: `db://${storageRecord.id}` })
            .where(eq(sessionsOutput.id, outputRecord.id))
        } catch (pdfErr) {
          console.error("Auto PDF generation failed:", pdfErr)
        }
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
    return Response.json({ error: message }, { status: 500 })
  }
}
