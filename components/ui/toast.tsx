"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"

import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (t: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastCounter = 0

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg transition-all",
              "animate-in slide-in-from-right-2",
              t.variant === "destructive" && "border-red-200 bg-red-50 text-red-800",
              t.variant === "success" && "border-green-200 bg-green-50 text-green-800"
            )}
          >
            <div className="flex-1">
              {t.title && <p className="font-medium">{t.title}</p>}
              {t.description && (
                <p className="text-mutedText">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-mutedText hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return ctx
}

const toast = (props: Omit<Toast, "id">) => {
  // Standalone toast call — relies on the provider context being available
  console.warn("useToast() should be used instead of standalone toast()")
}

export { ToastProvider, useToast, toast, type Toast }
