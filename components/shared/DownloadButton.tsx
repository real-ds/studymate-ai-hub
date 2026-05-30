"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DownloadButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "children" | "onClick"> {
  feature: "notes" | "flashcards" | "quiz" | "mindmap" | "revision"
  content?: string
  flashcards?: unknown[]
  questions?: unknown[]
  mindMap?: unknown
}

export default function DownloadButton({
  feature,
  content,
  flashcards,
  questions,
  mindMap,
  className,
  ...props
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          content,
          flashcards,
          questions,
          mindMap,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to generate PDF")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${feature}-export.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      {...props}
      onClick={handleDownload}
      disabled={loading || props.disabled}
      className={cn(className, "relative")}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {loading ? "Generating PDF..." : "Download PDF"}
    </Button>
  )
}
