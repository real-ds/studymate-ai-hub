"use client"

import StreamingOutput from "@/components/shared/StreamingOutput"

interface RevisionOutputProps {
  text: string
  isStreaming?: boolean
}

function renderRevisionMarkdown(text: string): string {
  const html = text
    .replace(/^### (.+)$/gm, "<h3 class=\"font-heading text-sm font-semibold text-darkPrimary mt-4 mb-1\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class=\"font-heading text-base font-bold text-darkPrimary mt-5 mb-2 pb-1 border-b border-stone-300\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class=\"font-heading text-lg font-bold text-darkPrimary mt-5 mb-2\">$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class=\"font-semibold text-darkPrimary\">$1</strong>")
    .replace(/\*(.+?)\*/g, "<em class=\"text-stone-600\">$1</em>")
    .replace(/^> (.+)$/gm, "<div class=\"my-1 rounded border-l-2 border-warmAmber bg-amber-50/80 px-3 py-1.5 text-xs text-stone-700\">$1</div>")
    .replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc text-xs leading-relaxed text-stone-700\">$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class=\"ml-4 list-decimal text-xs leading-relaxed text-stone-700\">$2</li>")
    .replace(/^---$/gm, "<hr class=\"my-3 border-stone-200\" />")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-stone-100 px-1 py-0.5 text-xs font-mono text-stone-800\">$1</code>")
    .replace(/^(?!<[hlpcdh]|<li|<di|<pre)(.+)$/gm, (match: string) => {
      const trimmed = match.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("<")) return match
      return `<p class="text-xs leading-relaxed text-stone-700 mb-1">${trimmed}</p>`
    })
    .replace(/(<li[^>]*>.*<\/li>)\n\n(?=<li)/g, "$1\n")

  return html
}

export default function RevisionOutput({ text, isStreaming }: RevisionOutputProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-darkPrimary">
            Revision Cheat Sheet
          </h2>
          <p className="text-xs text-mutedText">Last-minute exam prep</p>
        </div>
        {isStreaming && (
          <span className="flex items-center gap-2 text-xs text-warmAmber">
            <span className="inline-block size-2 animate-pulse rounded-full bg-warmAmber" />
            Generating...
          </span>
        )}
      </div>
      <div
        className="mx-auto"
        style={{
          maxWidth: "210mm",
          minHeight: "297mm",
          padding: "15mm 20mm",
          backgroundColor: "#fff",
          fontFamily: "Inter, sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          columnCount: 2,
          columnGap: "16px",
        }}
      >
        {isStreaming ? (
          <StreamingOutput text={text} speed={15} />
        ) : text ? (
          <div dangerouslySetInnerHTML={{ __html: renderRevisionMarkdown(text) }} />
        ) : (
          <p className="text-xs text-mutedText">No content yet.</p>
        )}
      </div>
    </div>
  )
}
