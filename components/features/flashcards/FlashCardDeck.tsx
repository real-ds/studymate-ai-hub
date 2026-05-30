"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import FlashCard from "./FlashCard"
import { Button } from "@/components/ui/button"
import type { Flashcard } from "@/types/feature.types"

interface FlashCardDeckProps {
  cards: Flashcard[]
}

export default function FlashCardDeck({ cards }: FlashCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [known, setKnown] = useState<Set<number>>(new Set())
  const [unknown, setUnknown] = useState<Set<number>>(new Set())
  const [showUnknownOnly, setShowUnknownOnly] = useState(false)

  const filteredCards = showUnknownOnly
    ? cards.filter((_, i) => unknown.has(i))
    : cards

  const displayIndex = showUnknownOnly
    ? filteredCards.indexOf(cards[currentIndex])
    : currentIndex

  const currentCard = filteredCards[displayIndex] || cards[currentIndex]

  const goToNext = useCallback(() => {
    if (displayIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => {
        if (showUnknownOnly) {
          const unknownIndices = cards
            .map((_, i) => i)
            .filter((i) => unknown.has(i))
          const currentUnknownPos = unknownIndices.indexOf(prev)
          const nextUnknown = unknownIndices[currentUnknownPos + 1]
          return nextUnknown ?? prev
        }
        return prev + 1
      })
    }
  }, [displayIndex, filteredCards.length, showUnknownOnly, cards, unknown])

  const goToPrev = useCallback(() => {
    if (displayIndex > 0) {
      setCurrentIndex((prev) => {
        if (showUnknownOnly) {
          const unknownIndices = cards
            .map((_, i) => i)
            .filter((i) => unknown.has(i))
          const currentUnknownPos = unknownIndices.indexOf(prev)
          const prevUnknown = unknownIndices[currentUnknownPos - 1]
          return prevUnknown ?? prev
        }
        return prev - 1
      })
    }
  }, [displayIndex, showUnknownOnly, cards, unknown])

  const handleKnown = () => {
    setKnown((prev) => new Set(prev).add(currentIndex))
    if (displayIndex < filteredCards.length - 1) {
      setTimeout(goToNext, 300)
    }
  }

  const handleUnknown = () => {
    setUnknown((prev) => new Set(prev).add(currentIndex))
    if (displayIndex < filteredCards.length - 1) {
      setTimeout(goToNext, 300)
    }
  }

  const handleReviewUnknown = () => {
    setShowUnknownOnly(true)
    const firstUnknown = cards.findIndex((_, i) => unknown.has(i))
    setCurrentIndex(firstUnknown >= 0 ? firstUnknown : 0)
  }

  const handleReset = () => {
    setShowUnknownOnly(false)
    setKnown(new Set())
    setUnknown(new Set())
    setCurrentIndex(0)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "ArrowLeft") goToPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrev])

  const totalCards = filteredCards.length
  const progress = ((displayIndex + 1) / totalCards) * 100

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-lg items-center justify-between">
        <span className="text-sm text-mutedText">
          Card {displayIndex + 1} of {totalCards}
        </span>
        <span className="text-sm text-mutedText">
          {known.size} known &middot; {unknown.size} unknown
        </span>
      </div>

      <div className="h-2 w-full max-w-lg overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-warmAmber transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <FlashCard
        card={currentCard}
        onKnown={handleKnown}
        onUnknown={handleUnknown}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrev}
          disabled={displayIndex === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={displayIndex >= totalCards - 1}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex gap-3">
        {unknown.size > 0 && !showUnknownOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReviewUnknown}
            className="border-amber-300 text-amber-700"
          >
            <RotateCcw className="size-4" />
            Review Unknown ({unknown.size})
          </Button>
        )}
        {showUnknownOnly && unknown.size === 0 && (
          <p className="text-sm text-green-600">All cards reviewed!</p>
        )}
        {(known.size > 0 || unknown.size > 0) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
