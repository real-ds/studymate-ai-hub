"use client"

import { useApiKeys } from "@/hooks/useApiKeys"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KeyIcon } from "lucide-react"
import Link from "next/link"

interface FeatureGuardProps {
  children: React.ReactNode
}

export default function FeatureGuard({ children }: FeatureGuardProps) {
  const { keys, isLoading } = useApiKeys()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 animate-spin rounded-full border-2 border-warmAmber border-t-transparent" />
      </div>
    )
  }

  if (keys.length === 0) {
    return (
      <Card className="mx-auto max-w-md py-8">
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-warmAmber/10 p-4">
            <KeyIcon className="size-8 text-warmAmber" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-darkPrimary">
            API Key Required
          </h3>
          <p className="text-sm text-mutedText">
            You need to add an API key before using this feature. Add your Gemini or OpenAI key in your profile settings.
          </p>
          <Link href="/profile">
            <Button variant="default" className="bg-warmAmber text-white hover:bg-warmAmber/90">
              Go to Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
