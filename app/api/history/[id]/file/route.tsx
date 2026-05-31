import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { fileRecords, sessionsOutput } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { pdf } from "@react-pdf/renderer"
import { NotesPDF, FlashcardsPDF, QuizPDF, MindMapPDF, RevisionPDF } from "@/lib/pdf-templates"
import type { Flashcard, QuizQuestion, MindMapNode } from "@/types/feature.types"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params // fileRecordId
    const { searchParams } = new URL(request.url)
    const download = searchParams.get("download") === "true"

    // 1. Fetch file record to verify ownership and get original name + feature
    const record = await db
      .select()
      .from(fileRecords)
      .where(
        and(
          eq(fileRecords.id, id),
          eq(fileRecords.userId, session.user.id)
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!record) {
      return Response.json({ error: "File record not found" }, { status: 404 })
    }

    // 2. Fetch session output containing the generated data
    const output = await db
      .select()
      .from(sessionsOutput)
      .where(
        and(
          eq(sessionsOutput.fileRecordId, id),
          eq(sessionsOutput.userId, session.user.id)
        )
      )
      .then((rows) => rows[0] ?? null)

    if (!output) {
      return Response.json({ error: "Converted output not found. Please wait for generation to finish." }, { status: 404 })
    }

    // 3. Render appropriate PDF based on feature
    let doc: React.ReactElement
    const baseName = record.originalName.replace(/\.[^/.]+$/, "") // strip extension
    const filename = `${baseName}-${record.feature}.pdf`

    switch (record.feature) {
      case "notes":
        doc = <NotesPDF content={output.outputText || ""} />
        break
      case "flashcards":
        doc = <FlashcardsPDF cards={(output.outputJson || []) as Flashcard[]} />
        break
      case "quiz":
        doc = <QuizPDF questions={(output.outputJson || []) as QuizQuestion[]} />
        break
      case "mindmap":
        doc = <MindMapPDF root={output.outputJson as MindMapNode} />
        break
      case "revision":
        doc = <RevisionPDF content={output.outputText || ""} />
        break
      default:
        return Response.json({ error: "Unsupported feature" }, { status: 400 })
    }

    // 4. Generate the PDF buffer using react-pdf
    const pdfFn = pdf as unknown as (d: unknown) => { toBuffer: () => Promise<Buffer> }
    const buffer = await pdfFn(doc as unknown).toBuffer()

    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    
    const encodedName = encodeURIComponent(filename)
    const disposition = download ? "attachment" : "inline"
    headers.set(
      "Content-Disposition", 
      `${disposition}; filename*=UTF-8''${encodedName}; filename="${filename}"`
    )

    return new Response(new Uint8Array(buffer), {
      headers,
    })
  } catch (error) {
    console.error("GET /api/history/[id]/file error:", error)
    return Response.json({ error: "Failed to generate converted PDF" }, { status: 500 })
  }
}
