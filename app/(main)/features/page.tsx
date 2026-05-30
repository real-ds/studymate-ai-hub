import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import {
  FileText,
  Layers,
  ListChecks,
  Share2,
  FileEdit,
} from "lucide-react"

const allFeatures = [
  {
    id: "notes",
    icon: FileText,
    title: "Notes Conversion",
    description:
      "Upload your study materials — PDFs, PowerPoint slides, Word documents, text files, or images — and receive structured, comprehensive notes. The AI extracts key concepts, organizes them under clear headings, adds bullet-point summaries, and highlights definitions. Choose between compact or detailed modes, and download the result as a formatted PDF.",
  },
  {
    id: "flashcards",
    icon: Layers,
    title: "Flashcards",
    description:
      "Turn any study material into a deck of interactive flashcards. Each card has a front (question or term) and back (answer or definition). Flip through the deck, mark cards as known or unknown, and focus on the ones you haven't mastered yet. Export your deck as a PDF grid for offline review.",
  },
  {
    id: "quiz",
    icon: ListChecks,
    title: "MCQ Quiz",
    description:
      "Generate multiple-choice quizzes from your content. Choose the number of questions (5–30) and difficulty level (Easy, Medium, Hard). Each question comes with four options, one correct answer, and a detailed explanation. Optional timed mode adds pressure. Review your score and wrong answers at the end.",
  },
  {
    id: "mindmap",
    icon: Share2,
    title: "Mind Maps",
    description:
      "Visualize the structure of any topic with an interactive, zoomable mind map. The AI builds a hierarchical tree up to three levels deep — main topic, key themes, subtopics, and detail points. Click any node to see a detailed snippet. Export the map as a PNG image or a static PDF.",
  },
  {
    id: "revision",
    icon: FileEdit,
    title: "Revision Notes",
    description:
      "Get a dense, exam-focused cheat sheet that condenses your study material into the essential information. Prioritizing definitions, key formulas, important dates, and summary bullets. Designed to fit on one or two A4 pages — perfect for last-minute review before an exam.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Features"
        description="Five powerful tools to transform how you study."
      />

      <div className="space-y-8">
        {allFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-warmAmber/10">
                  <Icon className="size-7 text-warmAmber" />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="font-heading text-xl font-semibold text-darkPrimary">
                    {feature.title}
                  </h2>
                  <p className="leading-relaxed text-mutedText">
                    {feature.description}
                  </p>
                  <Link href={`/feature/${feature.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-fit"
                    >
                      Try {feature.title.split(" ")[0]}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
