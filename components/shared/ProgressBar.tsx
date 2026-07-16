"use client"

interface ProgressBarProps {
  percent: number
  phase: string
}

const phases: Record<string, string> = {
  "Starting...": "Uploading file",
  "Analysing...": "Analysing your content",
  "Generating...": "Generating notes via AI",
  "Creating PDF...": "Creating PDF preview",
  "Done!": "Complete",
}

export default function ProgressBar({ percent, phase }: ProgressBarProps) {
  const displayLabel = phases[phase] || phase

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-mutedText">{displayLabel}</span>
        <span className="font-mono text-xs text-mutedText">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-darkPrimary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}
