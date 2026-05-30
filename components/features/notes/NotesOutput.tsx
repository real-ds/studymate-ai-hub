"use client"

import StreamingOutput from "@/components/shared/StreamingOutput"

interface NotesOutputProps {
  text: string
  isStreaming?: boolean
  mode?: "compact" | "detailed"
}

function renderMarkdown(text: string): string {
  const html = text
    .replace(/^### (.+)$/gm, "<h3 class=\"font-heading text-lg font-semibold text-darkPrimary mt-6 mb-2\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class=\"font-heading text-xl font-semibold text-darkPrimary mt-8 mb-3 pb-1 border-b border-stone-200\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class=\"font-heading text-2xl font-bold text-darkPrimary mt-8 mb-4\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"font-semibold text-darkPrimary\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<div class=\"my-3 rounded-lg border-l-4 border-warmAmber bg-amber-50 px-4 py-3 text-sm text-stone-700\">$1</div>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-5 list-disc text-stone-700 leading-relaxed\">$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class=\"ml-5 list-decimal text-stone-700 leading-relaxed\">$2</li>")
    .replace(/^---$/gm, "<hr class=\"my-6 border-stone-200\" />")
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre class=\"my-4 overflow-x-auto rounded-lg bg-stone-900 p-4 text-sm text-stone-100\"><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-stone-100 px-1.5 py-0.5 text-sm font-mono text-stone-800\">$1</code>")
    .replace(/^(?!<[hlpcdh]|<li|<di|<pre)(.+)$/gm, (match: string) => {
      const trimmed = match.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("<")) return match
      return `<p class="text-stone-700 leading-relaxed mb-3">${trimmed}</p>`
    })
    .replace(/(<li[^>]*>.*<\/li>)\n\n(?=<li)/g, "$1\n")

  return html
}

export default function NotesOutput({ text, isStreaming, mode }: NotesOutputProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-darkPrimary">
          {mode === "compact" ? "Compact Notes" : "Detailed Notes"}
        </h2>
        {isStreaming && (
          <span className="flex items-center gap-2 text-xs text-warmAmber">
            <span className="inline-block size-2 animate-pulse rounded-full bg-warmAmber" />
            Generating...
          </span>
        )}
      </div>
      <div className="prose-custom">
        {isStreaming ? (
          <StreamingOutput text={text} speed={20} />
        ) : text ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
        ) : (
          <p className="text-sm text-mutedText">No content yet.</p>
        )}
      </div>
    </div>
  )
}
