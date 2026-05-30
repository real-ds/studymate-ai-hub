"use client"

import { useState, useCallback, useRef } from "react"

interface UseStreamReturn {
  streamData: string
  isStreaming: boolean
  startStream: (url: string, body?: object) => Promise<void>
  stopStream: () => void
  error: string | null
}

export function useStream(): UseStreamReturn {
  const [streamData, setStreamData] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const startStream = useCallback(async (url: string, body?: object) => {
    stopStream()
    setStreamData("")
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      setIsStreaming(true)

      const res = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || `Request failed with status ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error("Response body is not readable")
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        setStreamData((prev) => prev + chunk)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      setError(err instanceof Error ? err.message : "Stream error")
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [stopStream])

  return { streamData, isStreaming, startStream, stopStream, error }
}
