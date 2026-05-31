"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import ProfileCard from "@/components/profile/ProfileCard"
import ThemeSelectorCard from "@/components/profile/ThemeSelectorCard"
import ApiKeyManager from "@/components/profile/ApiKeyManager"
import UsageStats from "@/components/profile/UsageStats"
import PageHeader from "@/components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProfileStats {
  totalFiles: number
  totalSessions: number
  features: Record<string, number>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<ProfileStats>({
    totalFiles: 0,
    totalSessions: 0,
    features: {},
  })
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return

    const sessionEmail = session.user.email
    let cancelled = false

    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile", {
          headers: { "Cache-Control": "no-cache" },
        })
        if (!res.ok) throw new Error("Failed to fetch profile")
        const data = await res.json()

        if (cancelled) return

        if (data.email !== sessionEmail) {
          setFetchError("Session mismatch — please sign out and sign in again")
          return
        }

        setStats({
          totalFiles: data.stats?.filesProcessed ?? 0,
          totalSessions: data.stats?.outputsGenerated ?? 0,
          features: data.stats?.features ?? {},
        })
        setFetchError(null)
      } catch {
        if (!cancelled) setFetchError("Failed to load usage data")
      }
    }

    fetchProfile()

    return () => { cancelled = true }
  }, [status, session?.user?.email])

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-warmAmber border-t-transparent" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Profile"
        description="Manage your account and view usage."
      />
      {fetchError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{fetchError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      )}
      <ProfileCard />
      <ThemeSelectorCard />
      <ApiKeyManager />
      <UsageStats stats={stats} />
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-mutedText">
            Sign out of your account. You will need to sign in again to access your files and features.
          </p>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-10 rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
