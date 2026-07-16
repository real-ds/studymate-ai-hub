"use client"

interface RevisionOutputProps {
  text: string
  isStreaming?: boolean
}

function renderRevisionMarkdown(text: string): string {
  let html = text.replace(/\r\n/g, "\n")

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : ""
    return `<pre class="my-2 overflow-x-auto rounded bg-stone-100 border border-stone-200 p-2 text-xs font-mono text-stone-800"><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-stone-100 px-1 py-0.5 text-xs font-mono text-stone-800">$1</code>')

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<div class="my-1 rounded border-l-2 border-warmAmber bg-amber-50/80 px-3 py-1.5 text-xs text-stone-700">$1</div>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-3 border-stone-200" />')

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4 class="font-heading text-xs font-semibold text-darkPrimary mt-3 mb-1">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-heading text-sm font-semibold text-darkPrimary mt-4 mb-1">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-heading text-base font-bold text-darkPrimary mt-5 mb-2 pb-1 border-b border-stone-300">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-heading text-lg font-bold text-darkPrimary mt-5 mb-2">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-darkPrimary">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em class="text-stone-600">$1</em>')

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-xs leading-relaxed text-stone-700">$1. $2</li>')

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-xs leading-relaxed text-stone-700">$1</li>')

  // Paragraphs
  const lines = html.split("\n")
  const result: string[] = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      if (inList) {
        result.push("")
        inList = false
      }
      continue
    }
    if (line.startsWith("<h") || line.startsWith("<pre") || line.startsWith("<div") || line.startsWith("<hr") || line.startsWith("<li")) {
      result.push(line)
      if (line.startsWith("<li")) inList = true
      continue
    }
    if (inList) {
      result.push("")
      inList = false
    }
    result.push(`<p class="text-xs leading-relaxed text-stone-700 mb-1">${line}</p>`)
  }

  return result.join("\n")
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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
        {text ? (
          <div>
            <div dangerouslySetInnerHTML={{ __html: renderRevisionMarkdown(text) }} />
            {isStreaming && (
              <span className="inline-block size-2 animate-pulse rounded-full bg-warmAmber ml-1" />
            )}
          </div>
        ) : (
          <p className="text-xs text-mutedText">No content yet.</p>
        )}
      </div>
    </div>
  )
}
