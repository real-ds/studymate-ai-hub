"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import FlashCardDeck from "./FlashCardDeck"
import ProgressBar from "@/components/shared/ProgressBar"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import DownloadButton from "@/components/shared/DownloadButton"
import type { Flashcard } from "@/types/feature.types"

type ProgressPhase = "Starting..." | "Analysing..." | "Generating..." | "Done!"

export default function FlashcardsPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cardCount, setCardCount] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const [progressPercent, setProgressPercent] = useState(0)
  const [progressPhase, setProgressPhase] = useState<ProgressPhase>("Starting...")

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startProgressSimulation = useCallback(() => {
    let percent = 10
    setProgressPercent(10)
    setProgressPhase("Analysing...")
    let steps = 0

    const interval = setInterval(() => {
      steps++
      if (steps < 5) {
        percent = Math.min(percent + 8, 40)
      } else {
        if (steps === 5) setProgressPhase("Generating...")
        percent = Math.min(percent + 2 + Math.random() * 4, 90)
      }
      setProgressPercent(Math.round(percent))
    }, 1000)

    progressIntervalRef.current = interval
  }, [])

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setFlashcards([])
    setError(null)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setFlashcards([])
    setError(null)
    setProgressPercent(0)
    setProgressPhase("Starting...")

    startProgressSimulation()

    try {
      const response = await fetch("/api/features/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileRecordId, options: { count: cardCount } }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to generate flashcards")
      }

      const data = await response.json()
      setFlashcards(data.flashcards || [])
      setProgressPercent(100)
      setProgressPhase("Done!")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to generate flashcards")
    } finally {
      setIsLoading(false)
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Flashcards"
        description="Generate interactive flashcards for active recall"
      />

      <FileDropzone feature="flashcards" onUploadComplete={handleUploadComplete} />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-semibold">Generation Failed</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {fileRecordId && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-warmAmber text-white hover:bg-warmAmber/90"
          >
            {isLoading ? <LoadingSpinner size={16} /> : "Generate Flashcards"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-mutedText">Cards:</span>
            <input
              type="range"
              min={10}
              max={50}
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-24 accent-warmAmber"
            />
            <span className="w-8 text-sm text-darkPrimary">{cardCount}</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-8">
          <ProgressBar percent={progressPercent} phase={progressPhase} />
        </div>
      )}

      {flashcards.length > 0 && !isLoading && (
        <div className="mt-8">
          <FlashCardDeck cards={flashcards} />
          <div className="mt-8 flex justify-center">
            <DownloadButton
                feature="flashcards"
                flashcards={flashcards}
                className="bg-warmAmber text-white hover:bg-warmAmber/90"
              />
          </div>
        </div>
      )}
    </div>
  )
}
