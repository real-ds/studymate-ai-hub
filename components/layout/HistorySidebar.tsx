"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, ChevronRight, History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import HistorySidebarItem, {
  type HistoryItem,
} from "./HistorySidebarItem"

const FEATURE_PAGES = ["/feature/notes", "/feature/flashcards", "/feature/quiz", "/feature/mindmap", "/feature/revision"]

function isFeaturePage(path: string) {
  return FEATURE_PAGES.some((p) => path.startsWith(p))
}

function getFeatureFromPath(path: string): string | null {
  const match = path.match(/^\/feature\/([^/]+)/)
  return match ? match[1] : null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function HistorySidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(6)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const feature = getFeatureFromPath(pathname)
      const url = feature ? `/api/history?feature=${feature}` : "/api/history"
      const res = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
      })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(
        data.map((r: Record<string, string>) => ({
          id: r.id,
          filename: r.originalName,
          feature: r.feature,
          date: formatDate(r.createdAt),
          status: r.status as HistoryItem["status"],
          fileUrl: r.fileUrl,
        }))
      )
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [pathname])

  useEffect(() => {
    if (isFeaturePage(pathname) && session?.user?.email) {
      setItems([])
      setDisplayLimit(6)
      fetchHistory()
    }
  }, [pathname, session?.user?.email, fetchHistory])

  if (!isFeaturePage(pathname)) return null

  const handleSelect = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      router.push(`/feature/${item.feature}?historyId=${id}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }
    } catch {
      // ignore
    }
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-stone-200 bg-white transition-all duration-200",
        collapsed ? "w-14" : "w-72"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-stone-200 p-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <span className="flex items-center gap-2 text-sm font-medium text-darkPrimary">
            <History className="size-4" />
            History
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-mutedText" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-2 text-xs text-mutedText">No history yet</p>
          ) : (
            <div className="space-y-1">
              {items.slice(0, displayLimit).map((item) => (
                <HistorySidebarItem
                  key={item.id}
                  {...item}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              ))}
              {items.length > displayLimit && (
                <div className="pt-2 px-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-stone-500 hover:text-stone-900 border-none outline-none focus:outline-none focus:ring-0 active:outline-none shadow-none bg-transparent hover:bg-stone-100"
                    onClick={() => setDisplayLimit((prev) => prev + 10)}
                  >
                    View More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
