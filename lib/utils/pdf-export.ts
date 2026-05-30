import type { Flashcard, QuizQuestion, MindMapNode } from "@/types/feature.types"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n")
  const result: string[] = []
  let inCodeBlock = false
  let codeBuffer: string[] = []

  for (const rawLine of lines) {
    if (rawLine.trimStart().startsWith("```")) {
      if (inCodeBlock) {
        result.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`)
        codeBuffer = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine)
      continue
    }

    const trimmed = rawLine.trimStart()

    if (trimmed.startsWith("### ")) {
      result.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith("## ")) {
      result.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith("> ")) {
      result.push(`<blockquote>${parseInline(escapeHtml(trimmed.slice(2)))}</blockquote>`)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      result.push(`<li>${parseInline(escapeHtml(trimmed.slice(2)))}</li>`)
    } else if (/^\d+\.\s/.test(trimmed)) {
      result.push(`<li>${parseInline(escapeHtml(trimmed.replace(/^\d+\.\s/, "")))}</li>`)
    } else if (trimmed === "") {
      result.push("</ul><p>")
    } else {
      result.push(`<p>${parseInline(escapeHtml(trimmed))}</p>`)
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    result.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`)
  }

  let html = result.join("\n")
  html = html.replace(/<\/ul>\s*<p>/g, "</ul><p>")
  html = html.replace(/<p>\s*<\/ul>/g, "</ul>")
  html = html.replace(/<\/?(?:ul|ol)>\s*<li>/g, "<li>").replace(/<\/li>\s*<\/?(?:ul|ol)>/g, "</li>")
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)

  return html
}

function parseInline(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>")
  return text
}

function buildDocument(
  title: string,
  bodyContent: string,
  extraStyles: string = ""
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1C1C1E;
      background: #FFFFFF;
      padding: 40px;
    }
    h1, h2, h3, h4 {
      font-family: 'Playfair Display', Georgia, serif;
      color: #1C1C1E;
      margin-top: 1.2em;
      margin-bottom: 0.4em;
    }
    h1 { font-size: 24pt; border-bottom: 2px solid #C8A96E; padding-bottom: 6px; }
    h2 { font-size: 18pt; }
    h3 { font-size: 14pt; color: #C8A96E; }
    p { margin-bottom: 0.6em; }
    ul, ol { margin: 0.4em 0 0.6em 1.5em; }
    li { margin-bottom: 0.2em; }
    strong { font-weight: 600; }
    blockquote {
      border-left: 3px solid #C8A96E;
      padding-left: 12px;
      margin: 0.6em 0;
      color: #6B6B6B;
      font-style: italic;
    }
    pre {
      background: #FAF8F4;
      border: 1px solid #E5E0D6;
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      margin: 0.6em 0;
    }
    code {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      background: #FAF8F4;
      padding: 1px 4px;
      border-radius: 3px;
    }
    pre code { background: none; padding: 0; }
    .page-break { page-break-after: always; }
    @page { margin: 20mm 15mm; }
    @media print {
      body { padding: 0; }
    }
    ${extraStyles}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`
}

export function generateNotesHTML(outputText: string): string {
  const content = markdownToHtml(outputText)
  return buildDocument("Study Notes", `
    <h1>Study Notes</h1>
    ${content}
  `)
}

export function generateFlashcardsHTML(flashcards: Flashcard[]): string {
  const cards = flashcards
    .map(
      (card, i) => `
    <div class="card">
      <div class="card-front">
        <span class="card-number">${i + 1}</span>
        ${escapeHtml(card.front)}
      </div>
      <div class="card-back">
        <span class="card-number">${i + 1}</span>
        ${escapeHtml(card.back)}
        ${card.category ? `<div class="card-category">${escapeHtml(card.category)}</div>` : ""}
      </div>
    </div>`
    )
    .join("\n")

  return buildDocument("Flashcards", `
    <h1>Flashcards</h1>
    <div class="card-grid">${cards}</div>
  `, `
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .card {
      border: 1px solid #C8A96E;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .card-front, .card-back {
      padding: 12px;
      font-size: 10pt;
      line-height: 1.5;
    }
    .card-front {
      background: #FFFFFF;
      border-bottom: 1px dashed #E5E0D6;
      font-weight: 600;
    }
    .card-back {
      background: #FAF8F4;
    }
    .card-number {
      display: inline-block;
      background: #C8A96E;
      color: #FFFFFF;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      text-align: center;
      line-height: 18px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .card-category {
      margin-top: 6px;
      font-size: 8pt;
      color: #6B6B6B;
      font-style: italic;
    }
  `)
}

export function generateQuizHTML(questions: QuizQuestion[]): string {
  const correctCount = questions.length

  const questionsHtml = questions
    .map(
      (q, i) => `
    <div class="question">
      <h3>Question ${i + 1}</h3>
      <p class="q-text">${escapeHtml(q.question)}</p>
      <div class="options">
        ${q.options
          .map(
            (opt) =>
              `<div class="option${opt === q.correct ? " correct" : ""}">${escapeHtml(opt)}${opt === q.correct ? " ✓" : ""}</div>`
          )
          .join("\n        ")}
      </div>
      <div class="explanation">
        <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
      </div>
    </div>`
    )
    .join("\n")

  return buildDocument("Quiz", `
    <h1>Practice Quiz</h1>
    <div class="summary">
      <p><strong>Total Questions:</strong> ${correctCount}</p>
    </div>
    <div class="page-break"></div>
    ${questionsHtml}
  `, `
    .summary { margin: 16px 0; padding: 12px; background: #FAF8F4; border-radius: 6px; }
    .question {
      margin-bottom: 24px;
      page-break-inside: avoid;
      border: 1px solid #E5E0D6;
      border-radius: 8px;
      padding: 16px;
    }
    .q-text { font-weight: 500; margin-bottom: 10px; }
    .options { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .option {
      padding: 6px 10px;
      border: 1px solid #E5E0D6;
      border-radius: 4px;
      font-size: 10pt;
    }
    .option.correct {
      background: #E8F5E9;
      border-color: #66BB6A;
      font-weight: 600;
    }
    .explanation {
      font-size: 10pt;
      color: #6B6B6B;
      border-top: 1px solid #E5E0D6;
      padding-top: 8px;
      margin-top: 8px;
    }
  `)
}

function renderMindMapNode(node: MindMapNode, depth: number = 0): string {
  const indent = depth * 2
  const detail = node.detail ? `<p style="margin-left:${indent + 2}em;font-size:10pt;color:#6B6B6B;">${escapeHtml(node.detail)}</p>` : ""
  const children = node.children?.length
    ? `<ul style="margin-left:${indent + 2}em;">${node.children.map((c) => `<li>${renderMindMapNode(c, depth + 1)}</li>`).join("\n")}</ul>`
    : ""
  return `<div style="margin-left:${indent}em;"><strong>${escapeHtml(node.label)}</strong></div>${detail}${children}`
}

export function generateMindMapHTML(root: MindMapNode): string {
  const content = renderMindMapNode(root)
  return buildDocument("Mind Map", `
    <h1>Mind Map</h1>
    <div style="margin-top:16px;">${content}</div>
  `, `
    ul { list-style: none; padding-left: 0; }
    li { margin: 4px 0; }
  `)
}

export function generateRevisionHTML(outputText: string): string {
  const content = markdownToHtml(outputText)
  return buildDocument("Revision Notes", `
    <h1>Revision Notes</h1>
    <div class="revision-grid">${content}</div>
  `, `
    .revision-grid { columns: 2; column-gap: 20px; margin-top: 16px; }
    .revision-grid > * { break-inside: avoid; margin-bottom: 8px; }
    .revision-grid h2 { column-span: all; }
    .revision-grid h3 { color: #C8A96E; font-size: 12pt; }
    .revision-grid p { font-size: 10pt; }
    .revision-grid ul, .revision-grid ol { font-size: 10pt; }
    .revision-grid blockquote { font-size: 10pt; }
    @media print {
      .revision-grid { columns: 2; }
    }
  `)
}
