"use client"

import { useState, useCallback } from "react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import FlashCardDeck from "./FlashCardDeck"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import DownloadButton from "@/components/shared/DownloadButton"
import type { Flashcard } from "@/types/feature.types"

export default function FlashcardsPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cardCount, setCardCount] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setFlashcards([])
    setError(null)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setError(null)

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
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to generate flashcards")
    } finally {
      setIsLoading(false)
    }
  }

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
        <div className="mt-12 flex justify-center">
          <LoadingSpinner size={32} />
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
