import type { Metadata } from "next"
import RevisionPageClient from "@/components/features/revision/RevisionPageClient"

export const metadata: Metadata = {
  title: "Revision Notes | StudyMate AI HUB",
  description: "Generate condensed, exam-focused revision cheat sheets",
}

export default function RevisionPage() {
  return <RevisionPageClient />
}
