"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Award, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import DownloadButton from "@/components/shared/DownloadButton"
import type { QuizQuestion as QuizQuestionType } from "@/types/feature.types"

interface QuizResultsProps {
  questions: QuizQuestionType[]
  answers: Record<number, string>
  onRetry: () => void
}

const optionLabels = ["A", "B", "C", "D"]

export default function QuizResults({
  questions,
  answers,
  onRetry,
}: QuizResultsProps) {
  const correctCount = questions.filter(
    (q, i) => answers[i] === q.correct.toUpperCase()
  ).length
  const total = questions.length
  const percentage = Math.round((correctCount / total) * 100)

  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-warmAmber/10">
          <Award className="size-8 text-warmAmber" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold text-darkPrimary">
          Quiz Complete!
        </h2>
        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-warmAmber">{correctCount}</span>
          <span className="text-2xl text-mutedText">/ {total}</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-warmAmber transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-mutedText">{percentage}%</span>
        </div>

        {percentage >= 80 ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">Excellent work!</p>
        ) : percentage >= 50 ? (
          <p className="mt-3 text-sm font-medium text-amber-600">Good attempt!</p>
        ) : (
          <p className="mt-3 text-sm font-medium text-red-600">Keep practicing!</p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={onRetry}>
            <CheckCircle2 className="mr-1.5 size-4" />
            Try Again
          </Button>
          <DownloadButton
            feature="quiz"
            questions={questions}
            className="bg-warmAmber text-white hover:bg-warmAmber/90"
          />
        </div>
      </div>

      <div className="space-y-2">
        {questions.map((q, i) => {
          const correct = answers[i] === q.correct.toUpperCase()
          const isExpanded = expanded === i

          return (
            <div
              key={i}
              className={`rounded-xl border shadow-sm transition-colors ${
                correct
                  ? "border-emerald-200 bg-white"
                  : "border-red-200 bg-white"
              }`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                {correct ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="size-5 shrink-0 text-red-500" />
                )}
                <span className="flex-1 text-sm font-medium text-darkPrimary leading-relaxed">
                  {i + 1}. {q.question}
                </span>
                {isExpanded ? (
                  <ChevronUp className="size-4 shrink-0 text-mutedText" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-mutedText" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-stone-100 px-5 py-4">
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const label = optionLabels[oi]
                      const isCorrect = label === q.correct.toUpperCase()
                      const isSelected = answers[i] === label
                      return (
                        <div
                          key={label}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                            isCorrect
                              ? "bg-emerald-50 text-emerald-700"
                              : isSelected
                              ? "bg-red-50 text-red-700"
                              : "text-stone-500"
                          }`}
                        >
                          <span className="font-semibold">{label}.</span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-500" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="ml-auto size-4 shrink-0 text-red-500" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                    <span className="font-semibold text-darkPrimary">Explanation:</span>{" "}
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
