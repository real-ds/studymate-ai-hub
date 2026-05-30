"use client"

import { useState, useCallback } from "react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import NotesOutput from "./NotesOutput"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import DownloadButton from "@/components/shared/DownloadButton"

export default function NotesPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [mode, setMode] = useState<"compact" | "detailed">("detailed")

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setOutput("")
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setIsStreaming(true)
    setOutput("")

    try {
      const response = await fetch("/api/features/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileRecordId, options: { mode } }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to generate notes")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput((prev) => prev + decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Notes Conversion"
        description="Upload your study material and get AI-generated structured notes"
      />

      <FileDropzone feature="notes" onUploadComplete={handleUploadComplete} />

      {fileRecordId && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-warmAmber text-white hover:bg-warmAmber/90"
          >
            {isLoading ? <LoadingSpinner size={16} /> : "Generate Notes"}
          </Button>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "compact" | "detailed")}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-darkPrimary"
          >
            <option value="detailed">Detailed</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      )}

      {output && (
        <div className="mt-8">
          <NotesOutput text={output} isStreaming={isStreaming} mode={mode} />
          {!isStreaming && (
            <div className="mt-6">
              <DownloadButton
                feature="notes"
                content={output}
                className="bg-warmAmber text-white hover:bg-warmAmber/90"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
