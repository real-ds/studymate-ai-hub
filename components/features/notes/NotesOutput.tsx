"use client"

interface NotesOutputProps {
  text: string
  isStreaming?: boolean
  mode?: "compact" | "detailed"
}

function renderMarkdown(text: string): string {
  // Normalize line endings and trim trailing whitespace
  let html = text.replace(/\r\n/g, "\n")

  // Code blocks (must come before other transforms)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : ""
    return `<pre class="my-4 overflow-x-auto rounded-lg bg-stone-100 border border-stone-200 p-4 text-sm font-mono text-stone-800"><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-stone-100 px-1.5 py-0.5 text-sm font-mono text-stone-800">$1</code>')

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<div class="my-3 rounded-lg border-l-4 border-warmAmber bg-amber-50 px-4 py-3 text-sm text-stone-700">$1</div>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-6 border-stone-200" />')

  // Headings (must come before bold/italic)
  html = html.replace(/^#### (.+)$/gm, '<h4 class="font-heading text-base font-semibold text-darkPrimary mt-5 mb-2">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-heading text-lg font-semibold text-darkPrimary mt-6 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-heading text-xl font-semibold text-darkPrimary mt-8 mb-3 pb-1 border-b border-stone-200">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-heading text-2xl font-bold text-darkPrimary mt-8 mb-4">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-darkPrimary">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal text-stone-700 leading-relaxed">$1. $2</li>')

  // Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-5 list-disc text-stone-700 leading-relaxed">$1</li>')

  // Paragraphs: wrap remaining lines that aren't already wrapped
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
      // Blank lines between list items
      result.push("")
      inList = false
    }
    result.push(`<p class="text-stone-700 leading-relaxed mb-3">${line}</p>`)
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
        {text ? (
          <div>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
            {isStreaming && (
              <span className="inline-block size-2 animate-pulse rounded-full bg-warmAmber ml-1" />
            )}
          </div>
        ) : (
          <p className="text-sm text-mutedText">No content yet.</p>
        )}
      </div>
    </div>
  )
}
