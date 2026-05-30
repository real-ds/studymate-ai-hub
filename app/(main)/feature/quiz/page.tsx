import type { Metadata } from "next"
import QuizPageClient from "@/components/features/quiz/QuizPageClient"

export const metadata: Metadata = {
  title: "MCQ Quiz | StudyMate AI HUB",
  description: "Generate and take AI-powered practice quizzes",
}

export default function QuizPage() {
  return <QuizPageClient />
}
