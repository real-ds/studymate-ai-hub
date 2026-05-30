import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, Layers, ListChecks, Share2, FileEdit } from "lucide-react"

const FEATURE_ICONS: Record<string, typeof FileText> = {
  notes: FileText,
  flashcards: Layers,
  quiz: ListChecks,
  mindmap: Share2,
  revision: FileEdit,
}

const FEATURE_LABELS: Record<string, string> = {
  notes: "Notes",
  flashcards: "Flashcards",
  quiz: "Quiz",
  mindmap: "Mind Maps",
  revision: "Revision",
}

interface UsageStatsProps {
  stats: {
    totalFiles: number
    totalSessions: number
    features: Record<string, number>
  }
}

export default function UsageStats({ stats }: UsageStatsProps) {
  const featureEntries = Object.entries(stats.features ?? {})

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-warmAmber/10 p-3 text-center">
            <p className="text-2xl font-bold text-darkPrimary">{stats.totalFiles}</p>
            <p className="text-xs text-mutedText">Files Processed</p>
          </div>
          <div className="rounded-lg bg-warmAmber/10 p-3 text-center">
            <p className="text-2xl font-bold text-darkPrimary">
              {stats.totalSessions}
            </p>
            <p className="text-xs text-mutedText">Sessions</p>
          </div>
        </div>

        {featureEntries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-mutedText">By Feature</p>
            {featureEntries.map(([key, count]) => {
              const Icon = FEATURE_ICONS[key] ?? FileText
              const label = FEATURE_LABELS[key] ?? key
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md px-2 py-1"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-warmAmber" />
                    <span className="text-sm capitalize">{label}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
