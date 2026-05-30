import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Layers,
  ListChecks,
  Share2,
  FileEdit,
} from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Notes Conversion",
    description:
      "Transform your PDFs, slides, and documents into structured, detailed notes with headings, bullet points, and key callouts.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description:
      "Generate interactive flashcards for active recall. Flip, sort by known or unknown, and export for offline study.",
  },
  {
    icon: ListChecks,
    title: "MCQ Quiz",
    description:
      "Create timed practice quizzes with instant feedback. Review explanations and track your scores over time.",
  },
  {
    icon: Share2,
    title: "Mind Maps",
    description:
      "Visualize complex topics with interactive, zoomable mind maps. Click nodes to explore detailed explanations.",
  },
  {
    icon: FileEdit,
    title: "Revision Notes",
    description:
      "Get dense, exam-focused cheat sheets that condense your materials into the most critical points.",
  },
]

export default function HomePage() {
  return (
    <div>
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="font-heading text-5xl font-bold text-darkPrimary sm:text-6xl lg:text-7xl">
          StudyMate AI HUB
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-mutedText">
          Transform your study materials into structured learning formats
          &mdash; notes, flashcards, quizzes, mind maps, and revision
          sheets &mdash; powered by AI.
        </p>
        <Link href="/features">
          <Button
            size="lg"
            className="mt-8 bg-warmAmber text-white hover:bg-warmAmber/90"
          >
            Get Started
          </Button>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="rounded-lg bg-warmAmber/10 p-3">
                  <feature.icon className="size-6 text-warmAmber" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-darkPrimary">
                  {feature.title}
                </h3>
                <p className="text-sm text-mutedText">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
