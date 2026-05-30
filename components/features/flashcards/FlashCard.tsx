"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Flashcard } from "@/types/feature.types"

interface FlashCardProps {
  card: Flashcard
  onKnown?: () => void
  onUnknown?: () => void
}

export default function FlashCard({ card, onKnown, onUnknown }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => setFlipped((prev) => !prev)

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="group h-72 w-full max-w-lg cursor-pointer perspective-[1000px]"
        onClick={handleFlip}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleFlip() } }}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Flashcard back" : "Flashcard front"}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-stone-200 bg-white p-8 shadow-sm backface-hidden">
            <p className="text-center font-heading text-xl font-medium text-darkPrimary">
              {card.front}
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-warmAmber/30 bg-amber-50 p-8 shadow-sm [transform:rotateY(180deg)] backface-hidden">
            <p className="text-center text-base leading-relaxed text-stone-700">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-mutedText">
        Click card or press Space to flip
      </p>

      <div className="flex gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onUnknown?.() }}
          className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <XCircle className="size-4" />
          Unknown
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onKnown?.() }}
          className="flex items-center gap-2 rounded-lg border border-green-200 px-4 py-2 text-sm text-green-600 transition-colors hover:bg-green-50"
        >
          <CheckCircle2 className="size-4" />
          Known
        </button>
      </div>
    </div>
  )
}
