"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SparklesIcon } from "lucide-react"

export default function ApiKeyManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-green-100 p-2">
            <SparklesIcon className="size-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-darkPrimary">
              Automatic Multi-Provider Active
            </p>
            <p className="mt-1 text-sm text-mutedText">
              AI features are fully managed and powered by an automated round-robin pool across high-speed providers with automatic cooldown and failover. No manual API keys required.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
