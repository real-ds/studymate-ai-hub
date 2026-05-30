"use client"

import { useState, useCallback } from "react"
import type { HistoryItem, HistoryDetailResponse } from "@/types/history.types"

interface UseHistoryReturn {
  history: HistoryItem[]
  getHistory: (feature?: string) => Promise<void>
  getHistoryItem: (id: string) => Promise<HistoryDetailResponse | null>
  deleteHistory: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getHistory = useCallback(async (feature?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const params = feature ? `?feature=${encodeURIComponent(feature)}` : ""
      const res = await fetch(`/api/history${params}`)
      if (!res.ok) {
        throw new Error("Failed to fetch history")
      }
      const data = await res.json()
      setHistory(data.items ?? data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getHistoryItem = useCallback(async (id: string): Promise<HistoryDetailResponse | null> => {
    try {
      const res = await fetch(`/api/history/${id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch history item")
      }
      return await res.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history item")
      return null
    }
  }, [])

  const deleteHistory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete history item")
      }
      setHistory((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete history item")
      return false
    }
  }, [])

  return { history, getHistory, getHistoryItem, deleteHistory, isLoading, error }
}
