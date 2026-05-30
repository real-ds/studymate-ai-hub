import type { Metadata } from "next"
import FlashcardsPageClient from "@/components/features/flashcards/FlashcardsPageClient"

export const metadata: Metadata = {
  title: "Flashcards | StudyMate AI HUB",
  description: "Generate interactive flashcards from your study materials",
}

export default function FlashcardsPage() {
  return <FlashcardsPageClient />
}
