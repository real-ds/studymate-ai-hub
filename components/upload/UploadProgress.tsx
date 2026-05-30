import { Cloud, CheckCircle2, Loader2, XCircle } from "lucide-react"

interface UploadProgressProps {
  progress: number
  status: string
  fileName: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: "Ready", color: "bg-stone-200", icon: <Cloud className="h-4 w-4 text-[#6B6B6B]" /> },
  uploading: { label: "Uploading...", color: "bg-[#C8A96E]", icon: <Loader2 className="h-4 w-4 animate-spin text-[#C8A96E]" /> },
  done: { label: "Done", color: "bg-[#27AE60]", icon: <CheckCircle2 className="h-4 w-4 text-[#27AE60]" /> },
  error: { label: "Error", color: "bg-[#C0392B]", icon: <XCircle className="h-4 w-4 text-[#C0392B]" /> },
}

export default function UploadProgress({ progress, status, fileName }: UploadProgressProps) {
  const config = statusConfig[status] || statusConfig.idle

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#1C1C1E]">
          {config.icon}
          <span className="max-w-[200px] truncate font-medium">{fileName}</span>
        </div>
        <span className="text-xs text-[#6B6B6B]">{config.label}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${config.color}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {status === "uploading" && (
        <span className="text-right text-xs text-[#6B6B6B]">{progress}%</span>
      )}
    </div>
  )
}
