"use client"

import { useState } from "react"
import { useApiKeys } from "@/hooks/useApiKeys"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, Trash2Icon, KeyIcon } from "lucide-react"

const PROVIDERS = ["Gemini", "OpenAI"]

export default function ApiKeyManager() {
  const { keys, addKey, deleteKey, isLoading } = useApiKeys()
  const [showForm, setShowForm] = useState(false)
  const [provider, setProvider] = useState("Gemini")
  const [keyValue, setKeyValue] = useState("")
  const [label, setLabel] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!keyValue.trim()) return
    const result = await addKey(provider.toLowerCase(), keyValue.trim(), label.trim() || undefined)
    if (result) {
      setKeyValue("")
      setLabel("")
      setShowForm(false)
      setProvider("Gemini")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>API Keys</CardTitle>
          {!showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <PlusIcon className="mr-1 size-4" />
              Add Key
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-mutedText">Loading...</p>
        ) : keys.length === 0 && !showForm ? (
          <p className="text-sm text-mutedText">No API keys saved yet.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <KeyIcon className="size-4 text-warmAmber" />
                  <div>
                    <p className="text-sm font-medium capitalize">{key.provider}</p>
                    <p className="text-xs text-mutedText">
                      {key.keyPreview ?? "...XXXX"}
                    </p>
                  </div>
                </div>
                {confirmDelete === key.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => {
                        deleteKey(key.id)
                        setConfirmDelete(null)
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setConfirmDelete(key.id)}
                  >
                    <Trash2Icon className="size-4 text-mutedText hover:text-destructive" />
                  </Button>
                )}
              </div>
            ))}

            {showForm && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-mutedText">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-warmAmber"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-mutedText">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-warmAmber"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-mutedText">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Work account"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-warmAmber"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleAdd}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false)
                      setKeyValue("")
                      setLabel("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
