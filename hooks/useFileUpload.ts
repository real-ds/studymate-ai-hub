"use client"

import { useState, useCallback } from "react"

interface UseFileUploadReturn {
  upload: (file: File, feature: string) => Promise<{ fileRecordId: string; fileUrl: string } | null>
  progress: number
  status: string
  error: string | null
  reset: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress(0)
    setStatus("idle")
    setError(null)
  }, [])

  const upload = useCallback(async (file: File, feature: string) => {
    setStatus("uploading")
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("feature", feature)

      const xhr = new XMLHttpRequest()

      const result = await new Promise<{ fileRecordId: string; fileUrl: string }>(
        (resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(pct)
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              try {
                const err = JSON.parse(xhr.responseText)
                reject(new Error(err.error || "Upload failed"))
              } catch {
                reject(new Error("Upload failed"))
              }
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network error")))
          xhr.open("POST", "/api/upload")
          xhr.send(formData)
        }
      )

      setProgress(100)
      setStatus("done")
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setError(message)
      setStatus("error")
      return null
    }
  }, [])

  return { upload, progress, status, error, reset }
}
