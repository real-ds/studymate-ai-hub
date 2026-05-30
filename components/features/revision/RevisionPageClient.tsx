"use client"

import { useState, useCallback } from "react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import RevisionOutput from "./RevisionOutput"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import DownloadButton from "@/components/shared/DownloadButton"

export default function RevisionPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

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
      const response = await fetch("/api/features/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileRecordId }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to generate revision notes")
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Revision Notes"
        description="Generate dense, exam-focused cheat sheets for last-minute prep"
      />

      <FileDropzone feature="revision" onUploadComplete={handleUploadComplete} />

      {fileRecordId && (
        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-warmAmber text-white hover:bg-warmAmber/90"
          >
            {isLoading ? <LoadingSpinner size={16} /> : "Generate Revision Notes"}
          </Button>
        </div>
      )}

      {output && (
        <div className="mt-8">
          <RevisionOutput text={output} isStreaming={isStreaming} />
          {!isStreaming && (
            <div className="mt-6 flex justify-center">
              <DownloadButton
                  feature="revision"
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
