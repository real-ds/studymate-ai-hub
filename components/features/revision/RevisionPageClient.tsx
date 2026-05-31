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
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setOutput("")
    setError(null)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setIsStreaming(true)
    setOutput("")
    setError(null)

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
      setError(err instanceof Error ? err.message : "Failed to generate revision notes")
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

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-semibold">Generation Failed</p>
          <p className="mt-1">{error}</p>
          {error.includes("API key") && (
            <p className="mt-2 text-xs font-semibold text-red-700">
              Go to your{" "}
              <a href="/profile" className="underline hover:text-red-900">
                Profile
              </a>{" "}
              and configure your Gemini API key to start using this feature.
            </p>
          )}
        </div>
      )}

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
