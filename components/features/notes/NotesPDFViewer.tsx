"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

interface NotesPDFViewerProps {
  sessionId: string
  filename?: string
}

export default function NotesPDFViewer({ sessionId, filename }: NotesPDFViewerProps) {
  const pdfUrl = `/api/sessions/${sessionId}/pdf`
  const downloadUrl = `${pdfUrl}?download=true`

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-darkPrimary">Generated PDF Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(pdfUrl, "_blank")}
            title="Open PDF in new tab"
          >
            <ExternalLink className="mr-1.5 size-3.5" />
            Open
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const a = document.createElement("a")
              a.href = downloadUrl
              a.download = filename || "notes-output.pdf"
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }}
            title="Download PDF"
          >
            <Download className="mr-1.5 size-3.5" />
            Download
          </Button>
        </div>
      </div>
      <div className="relative w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-50" style={{ height: "70vh" }}>
        <object
          data={pdfUrl}
          type="application/pdf"
          className="h-full w-full"
          aria-label="PDF preview"
        >
          <iframe
            src={pdfUrl}
            className="h-full w-full"
            title="PDF preview"
          >
            <p className="flex h-full items-center justify-center text-sm text-mutedText">
              Your browser does not support PDF preview.{" "}
              <a
                href={downloadUrl}
                className="ml-1 text-darkPrimary underline hover:no-underline"
              >
                Download instead
              </a>
            </p>
          </iframe>
        </object>
      </div>
    </div>
  )
}
