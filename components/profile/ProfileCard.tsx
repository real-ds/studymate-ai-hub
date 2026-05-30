"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PencilIcon, CheckIcon, XIcon } from "lucide-react"

export default function ProfileCard() {
  const { data: session, update } = useSession()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(session?.user?.name ?? "")

  const user = session?.user
  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSave = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await update()
        setEditing(false)
      }
    } catch {
      // silently fail
    }
  }

  const handleCancel = () => {
    setName(session?.user?.name ?? "")
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex size-16 items-center justify-center rounded-full bg-warmAmber text-lg font-bold text-white">
          {user?.image ? (
            <img
              src={user.image}
              alt="Avatar"
              className="size-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-warmAmber"
              />
              <Button size="icon-sm" variant="ghost" onClick={handleSave}>
                <CheckIcon className="size-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={handleCancel}>
                <XIcon className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-medium">
                {user?.name ?? "User"}
              </span>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <PencilIcon className="size-3.5" />
              </Button>
            </div>
          )}
          <span className="text-sm text-mutedText">{user?.email}</span>
        </div>
      </CardContent>
    </Card>
  )
}
