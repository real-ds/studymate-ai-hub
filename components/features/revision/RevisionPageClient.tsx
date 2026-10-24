"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import RevisionOutput from "./RevisionOutput"
import ProgressBar from "@/components/shared/ProgressBar"
import NotesPDFViewer from "@/components/features/notes/NotesPDFViewer"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import { readApiError } from "@/lib/http"

type ProgressPhase =
  | "Starting..."
  | "Analysing..."
  | "Generating..."
  | "Creating PDF..."
  | "Done!"

export default function RevisionPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [progressPercent, setProgressPercent] = useState(0)
  const [progressPhase, setProgressPhase] = useState<ProgressPhase>("Starting...")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showPDF, setShowPDF] = useState(false)

  const chunkCountRef = useRef(0)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  const startProgressSimulation = useCallback(() => {
    let percent = 10
    setProgressPercent(10)
    setProgressPhase("Analysing...")
    chunkCountRef.current = 0

    const interval = setInterval(() => {
      chunkCountRef.current += 1
      if (chunkCountRef.current < 5) {
        percent = Math.min(percent + 5, 40)
      } else {
        percent = Math.min(percent + 1 + Math.random() * 3, 85)
      }
      setProgressPercent(Math.round(percent))
    }, 800)

    progressIntervalRef.current = interval
  }, [])

  const pollForPDF = useCallback((sessionIdVal: string, attempt = 1) => {
    const maxAttempts = 20
    fetch(`/api/sessions/${sessionIdVal}/status`)
      .then((res) => {
        if (!res.ok) throw new Error("Not ready")
        return res.json()
      })
      .then((data) => {
        if (data.pdfReady) {
          setSessionId(sessionIdVal)
          sessionIdRef.current = sessionIdVal
          setProgressPercent(100)
          setProgressPhase("Done!")
          setShowPDF(true)
          setIsStreaming(false)
          setIsLoading(false)
        } else if (attempt < maxAttempts) {
          setProgressPercent(Math.min(92 + attempt, 98))
          setTimeout(() => pollForPDF(sessionIdVal, attempt + 1), 1500)
        } else {
          setProgressPercent(100)
          setProgressPhase("Done!")
          setIsStreaming(false)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (attempt < maxAttempts) {
          setProgressPercent(Math.min(92 + attempt, 98))
          setTimeout(() => pollForPDF(sessionIdVal, attempt + 1), 1500)
        } else {
          setProgressPercent(100)
          setProgressPhase("Done!")
          setIsStreaming(false)
          setIsLoading(false)
        }
      })
  }, [])

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setOutput("")
    setError(null)
    setSessionId(null)
    sessionIdRef.current = null
    setShowPDF(false)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setIsStreaming(true)
    setOutput("")
    setError(null)
    setSessionId(null)
    sessionIdRef.current = null
    setShowPDF(false)
    setProgressPercent(0)
    setProgressPhase("Starting...")

    startProgressSimulation()

    try {
      const response = await fetch("/api/features/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileRecordId }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response, "Failed to generate revision notes"))
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        const metaIdx = buffer.lastIndexOf("\n__META__:")
        if (metaIdx !== -1) {
          const metaLine = buffer.slice(metaIdx + 10).trim()
          try {
            const meta = JSON.parse(metaLine)
            if (meta.sessionId) {
              setSessionId(meta.sessionId)
              sessionIdRef.current = meta.sessionId
            }
          } catch {}
          const textPart = buffer.slice(0, metaIdx)
          setOutput(textPart)
          buffer = textPart
        } else {
          setOutput(buffer)
        }

        if (progressPhase === "Starting...") {
          setProgressPhase("Generating...")
        }
      }

      setProgressPhase("Creating PDF...")
      setProgressPercent(92)

      const sid = sessionIdRef.current
      if (sid) {
        pollForPDF(sid)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to generate revision notes")
      setIsLoading(false)
      setIsStreaming(false)
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

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

      {(isLoading || isStreaming) && !showPDF && (
        <div className="mt-8">
          <ProgressBar percent={progressPercent} phase={progressPhase} />
        </div>
      )}

      {output && !showPDF && (
        <div className="mt-8">
          <RevisionOutput text={output} isStreaming={isStreaming} />
        </div>
      )}

      {showPDF && sessionId && (
        <div className="mt-8">
          <NotesPDFViewer sessionId={sessionId} filename="revision-output.pdf" />
        </div>
      )}
    </div>
  )
}
