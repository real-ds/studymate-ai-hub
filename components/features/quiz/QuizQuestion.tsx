"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import type { QuizQuestion as QuizQuestionType } from "@/types/feature.types"

interface QuizQuestionProps {
  question: QuizQuestionType
  selectedAnswer: string | null
  onAnswer: (selected: string) => void
  showExplanation: boolean
  questionNumber: number
  totalQuestions: number
}

const optionLabels = ["A", "B", "C", "D"]

export default function QuizQuestion({
  question,
  selectedAnswer,
  onAnswer,
  showExplanation,
  questionNumber,
  totalQuestions,
}: QuizQuestionProps) {
  const correctIndex = optionLabels.indexOf(question.correct.toUpperCase())

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-mutedText uppercase tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-3 rounded-full transition-colors ${
                i < questionNumber - 1
                  ? "bg-warmAmber"
                  : i === questionNumber - 1
                  ? "bg-warmAmber/60"
                  : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="font-heading text-lg font-semibold text-darkPrimary leading-relaxed">
        {question.question}
      </h3>

      <div className="mt-5 space-y-2.5">
        {question.options.map((option, idx) => {
          const label = optionLabels[idx]
          const isSelected = selectedAnswer === label
          const isCorrect = idx === correctIndex
          const showCorrect = showExplanation && isCorrect
          const showWrong = showExplanation && isSelected && !isCorrect

          return (
            <button
              key={label}
              onClick={() => !showExplanation && onAnswer(label)}
              disabled={showExplanation}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                showCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : showWrong
                  ? "border-red-300 bg-red-50 text-red-800"
                  : isSelected
                  ? "border-warmAmber bg-amber-50 text-darkPrimary shadow-sm"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  showCorrect
                    ? "bg-emerald-500 text-white"
                    : showWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-warmAmber text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {showCorrect ? (
                  <CheckCircle2 className="size-4" />
                ) : showWrong ? (
                  <XCircle className="size-4" />
                ) : (
                  label
                )}
              </span>
              <span className="flex-1 leading-relaxed">{option}</span>
            </button>
          )
        })}
      </div>

      {showExplanation && (
        <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-semibold text-mutedText uppercase tracking-wider">
            Explanation
          </p>
          <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
