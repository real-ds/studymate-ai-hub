"use client"

import {
  FileText,
  Layers,
  ListChecks,
  Share2,
  FileEdit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const featureIcons = {
  notes: FileText,
  flashcards: Layers,
  quiz: ListChecks,
  mindmap: Share2,
  revision: FileEdit,
}

export type HistoryItem = {
  id: string
  filename: string
  feature: keyof typeof featureIcons
  date: string
  status: "done" | "failed" | "pending"
}

interface HistorySidebarItemProps extends HistoryItem {
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusColors = {
  done: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-yellow-500",
}

export default function HistorySidebarItem({
  id,
  filename,
  feature,
  date,
  status,
  onSelect,
  onDelete,
}: HistorySidebarItemProps) {
  const Icon = featureIcons[feature]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect?.(id)
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-stone-100"
    >
      <Icon className="size-4 shrink-0 text-mutedText" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-darkPrimary">{filename}</p>
        <p className="text-xs text-mutedText">{date}</p>
      </div>
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          statusColors[status]
        )}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.(id)
        }}
        aria-label="Delete history item"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  )
}
