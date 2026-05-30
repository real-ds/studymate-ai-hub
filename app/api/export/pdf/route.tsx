import { NextRequest } from "next/server"
import { auth } from "@/lib/auth/config"
import { pdf } from "@react-pdf/renderer"
import { NotesPDF, FlashcardsPDF, QuizPDF, MindMapPDF, RevisionPDF } from "@/lib/pdf-templates"
import type { Flashcard, QuizQuestion, MindMapNode } from "@/types/feature.types"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { feature, content, flashcards, questions, mindMap } = body

    if (!feature) {
      return Response.json({ error: "feature is required" }, { status: 400 })
    }

    let doc: React.ReactElement
    let filename: string

    switch (feature) {
      case "notes":
        doc = <NotesPDF content={content || ""} />
        filename = "notes-export.pdf"
        break
      case "flashcards":
        doc = <FlashcardsPDF cards={(flashcards || []) as Flashcard[]} />
        filename = "flashcards-export.pdf"
        break
      case "quiz":
        doc = <QuizPDF questions={(questions || []) as QuizQuestion[]} />
        filename = "quiz-export.pdf"
        break
      case "mindmap":
        doc = <MindMapPDF root={mindMap as MindMapNode} />
        filename = "mindmap-export.pdf"
        break
      case "revision":
        doc = <RevisionPDF content={content || ""} />
        filename = "revision-export.pdf"
        break
      default:
        return Response.json({ error: "Unsupported feature" }, { status: 400 })
    }

    const pdfFn = pdf as unknown as (d: unknown) => { toBuffer: () => Promise<ReadableStream> }
    const stream = await pdfFn(doc as unknown).toBuffer() as unknown as ReadableStream

    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
