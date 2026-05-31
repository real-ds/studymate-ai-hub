"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

const depthColors = [
  { bg: "bg-warmAmber", text: "text-white", border: "border-warmAmber" },
  { bg: "bg-amber-100", text: "text-stone-800", border: "border-amber-300" },
  { bg: "bg-amber-50", text: "text-stone-700", border: "border-amber-200" },
  { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200" },
]

function MindMapNode({ data }: NodeProps) {
  const depth = data.depth || 0
  const colors = depthColors[Math.min(depth, depthColors.length - 1)]

  return (
    <div
      className={`rounded-xl border-2 px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${colors.bg} ${colors.border}`}
    >
      <Handle type="target" position={Position.Left} className="!border-warmAmber !bg-warmAmber" />
      <div className="flex flex-col items-center">
        <span className={`whitespace-nowrap text-sm font-medium ${colors.text}`}>
          {data.label}
          {data.hasChildren && (
            <span className="ml-1.5 inline-block text-[10px] opacity-70">
              {data.isExpanded ? "▼" : "▶"}
            </span>
          )}
        </span>
        {data.detail && (
          <span className="mt-1 max-w-48 text-xs opacity-70 line-clamp-2">
            {data.detail}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!border-warmAmber !bg-warmAmber" />
    </div>
  )
}

export default memo(MindMapNode)
