import type { Metadata } from "next"
import MindMapPageClient from "@/components/features/mindmap/MindMapPageClient"

export const metadata: Metadata = {
  title: "Mind Map | StudyMate AI HUB",
  description: "Visualize your study material as interactive mind maps",
}

export default function MindMapPage() {
  return <MindMapPageClient />
}
