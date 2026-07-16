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
          <div className="mt-0.5 rounded-full bg-green-100 p-2 dark:bg-green-900/30">
            <SparklesIcon className="size-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-darkPrimary dark:text-lightPrimary">
              No configuration needed
            </p>
            <p className="mt-1 text-sm text-mutedText">
              AI features are powered by open-source models (Llama 3.3 70B via Groq, with HuggingFace as fallback). Everything works automatically — no API keys required.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
