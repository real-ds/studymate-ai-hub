import type { Metadata } from "next"
import NotesPageClient from "@/components/features/notes/NotesPageClient"

export const metadata: Metadata = {
  title: "Notes Conversion | StudyMate AI HUB",
  description: "Convert your study materials into structured, AI-generated notes",
}

export default function NotesPage() {
  return <NotesPageClient />
}
