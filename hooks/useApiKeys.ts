"use client"

import { useState, useCallback, useEffect } from "react"

interface ApiKey {
  id: string
  provider: string
  label: string | null
  isActive: boolean
  createdAt: string
  keyPreview: string
}

interface UseApiKeysReturn {
  keys: ApiKey[]
  addKey: (provider: string, key: string, label?: string) => Promise<ApiKey | null>
  deleteKey: (id: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useApiKeys(): UseApiKeysReturn {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/profile/api-keys")
      if (!res.ok) {
        throw new Error("Failed to fetch API keys")
      }
      const data = await res.json()
      setKeys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch API keys")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch("/api/profile/api-keys")
        if (!res.ok) {
          throw new Error("Failed to fetch API keys")
        }
        const data = await res.json()
        if (!ignore) setKeys(data)
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to fetch API keys")
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const addKey = useCallback(async (
    provider: string,
    key: string,
    label?: string
  ): Promise<ApiKey | null> => {
    try {
      setError(null)
      const res = await fetch("/api/profile/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key, label }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add API key")
      }
      const created = await res.json()
      setKeys((prev) => [...prev, created])
      return created
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add API key")
      return null
    }
  }, [])

  const deleteKey = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const res = await fetch(`/api/profile/api-keys/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error("Failed to delete API key")
      }
      setKeys((prev) => prev.filter((k) => k.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key")
      return false
    }
  }, [])

  return { keys, addKey, deleteKey, isLoading, error }
}
