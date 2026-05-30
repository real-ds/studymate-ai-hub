"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ArrowRight, RefreshCw, Clock } from "lucide-react"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import QuizQuestion from "./QuizQuestion"
import QuizResults from "./QuizResults"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import type { QuizQuestion as QuizQuestionType } from "@/types/feature.types"

export default function QuizPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState("medium")
  const [timer, setTimer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredCurrent, setAnsweredCurrent] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setQuestions([])
    setAnswers({})
    setShowResults(false)
    setCurrentIndex(0)
    setAnsweredCurrent(false)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)
    setError(null)
    setQuestions([])
    setAnswers({})
    setShowResults(false)
    setCurrentIndex(0)
    setAnsweredCurrent(false)

    try {
      const response = await fetch("/api/features/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileRecordId,
          options: { count: questionCount, difficulty },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to generate quiz")
      }

      const data = await response.json()
      const qs = data.questions || []
      setQuestions(qs)

      if (timer && qs.length > 0) {
        setTimeLeft(timer * qs.length)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate quiz"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (selected: string) => {
    if (answeredCurrent) return
    const newAnswers = { ...answers, [currentIndex]: selected }
    setAnswers(newAnswers)
    setAnsweredCurrent(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setAnsweredCurrent(false)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setShowResults(true)
      setTimeLeft(null)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setShowResults(false)
    setCurrentIndex(0)
    setAnsweredCurrent(false)
    if (timer && questions.length > 0) {
      setTimeLeft(timer * questions.length)
    }
  }

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, showResults])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="MCQ Quiz"
        description="Generate and take AI-powered practice quizzes"
      />

      <FileDropzone feature="quiz" onUploadComplete={handleUploadComplete} />

      {fileRecordId && questions.length === 0 && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-warmAmber text-white hover:bg-warmAmber/90"
            >
              {isLoading ? <LoadingSpinner size={16} /> : "Generate Quiz"}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-mutedText">Questions:</span>
              <input
                type="range"
                min={5}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-20 accent-warmAmber"
              />
              <span className="w-6 text-center text-sm font-medium text-darkPrimary">
                {questionCount}
              </span>
            </div>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs text-darkPrimary"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={timer ?? ""}
              onChange={(e) => setTimer(e.target.value ? Number(e.target.value) : null)}
              className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs text-darkPrimary"
            >
              <option value="">No Timer</option>
              <option value="30">30s / q</option>
              <option value="60">60s / q</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-16 flex flex-col items-center gap-3">
          <LoadingSpinner size={28} />
          <p className="text-sm text-mutedText">Generating your quiz...</p>
        </div>
      )}

      {questions.length > 0 && !showResults && (
        <div className="mt-8">
          {timeLeft !== null && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm">
              <Clock className="size-4 text-mutedText" />
              <span className="text-mutedText">Time left:</span>
              <span
                className={`font-mono font-semibold ${
                  timeLeft < 30 ? "text-red-600" : "text-darkPrimary"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
              <div className="ml-auto h-2 w-24 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(timeLeft / (timer! * questions.length)) * 100}%`,
                    backgroundColor: timeLeft < 30 ? "#dc2626" : "#C8A96E",
                  }}
                />
              </div>
            </div>
          )}

          <QuizQuestion
            question={questions[currentIndex]}
            selectedAnswer={answers[currentIndex] || null}
            onAnswer={handleAnswer}
            showExplanation={answeredCurrent}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />

          {answeredCurrent && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-warmAmber text-white hover:bg-warmAmber/90"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 size-4" />
                  </>
                ) : (
                  "See Results"
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
            <span className="text-xs text-mutedText">
              Answered {Object.keys(answers).length} of {questions.length}
            </span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-warmAmber transition-all"
                style={{
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showResults && (
        <div className="mt-8">
          <QuizResults
            questions={questions}
            answers={answers}
            onRetry={handleRetry}
          />
        </div>
      )}
    </div>
  )
}
