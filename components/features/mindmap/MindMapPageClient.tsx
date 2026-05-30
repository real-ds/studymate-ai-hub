"use client"

import { useState, useCallback, useRef } from "react"
import { toPng } from "html-to-image"
import FileDropzone from "@/components/upload/FileDropzone"
import PageHeader from "@/components/shared/PageHeader"
import MindMapCanvas from "./MindMapCanvas"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import DownloadButton from "@/components/shared/DownloadButton"
import { ImageDown } from "lucide-react"
import type { MindMapNode } from "@/types/feature.types"

export default function MindMapPageClient() {
  const [fileRecordId, setFileRecordId] = useState<string | null>(null)
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleUploadComplete = useCallback((id: string) => {
    setFileRecordId(id)
    setMindMap(null)
  }, [])

  const handleGenerate = async () => {
    if (!fileRecordId) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/features/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileRecordId }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to generate mind map")
      }

      const data = await response.json()
      setMindMap(data.mindMap || null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPNG = async () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: "#FAF8F4",
        pixelRatio: 2,
      })
      const link = document.createElement("a")
      link.download = "mindmap.png"
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Failed to export PNG:", err)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Mind Map"
        description="Visualize complex topics with interactive, zoomable mind maps"
      />

      <FileDropzone feature="mindmap" onUploadComplete={handleUploadComplete} />

      {fileRecordId && !mindMap && (
        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-warmAmber text-white hover:bg-warmAmber/90"
          >
            {isLoading ? <LoadingSpinner size={16} /> : "Generate Mind Map"}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="mt-12 flex justify-center">
          <LoadingSpinner size={32} />
        </div>
      )}

      {mindMap && !isLoading && (
        <div className="mt-8" ref={canvasRef}>
          <MindMapCanvas data={mindMap} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleExportPNG}
              className="border-stone-300"
            >
              <ImageDown className="size-4" />
              Export PNG
            </Button>
            <DownloadButton
                feature="mindmap"
                mindMap={mindMap}
                className="bg-warmAmber text-white hover:bg-warmAmber/90"
              />
          </div>
        </div>
      )}
    </div>
  )
}
