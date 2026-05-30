"use client"

import { Fragment } from "react"

interface MarkdownRendererProps {
  content: string
}

interface ParsedNode {
  type: "heading" | "list" | "ordered-list" | "code" | "quote" | "paragraph" | "empty"
  level?: number
  children: InlineNode[]
}

interface InlineNode {
  text: string
  bold?: boolean
  italic?: boolean
}

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ text: text.slice(lastIndex, match.index) })
    }
    if (match[2]) {
      nodes.push({ text: match[2], bold: true, italic: true })
    } else if (match[3]) {
      nodes.push({ text: match[3], bold: true })
    } else if (match[4]) {
      nodes.push({ text: match[4], italic: true })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push({ text: text.slice(lastIndex) })
  }

  return nodes
}

function renderInline(nodes: InlineNode[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    let content: React.ReactNode = node.text
    if (node.bold && node.italic) {
      content = <strong key={i}><em>{node.text}</em></strong>
    } else if (node.bold) {
      content = <strong key={i}>{node.text}</strong>
    } else if (node.italic) {
      content = <em key={i}>{node.text}</em>
    }
    return <Fragment key={i}>{content}</Fragment>
  })
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n")
  const blocks: ParsedNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({
        type: "code",
        children: [{ text: codeLines.join("\n") }],
      })
    } else if (trimmed.startsWith("### ")) {
      blocks.push({
        type: "heading",
        level: 3,
        children: parseInline(trimmed.slice(4)),
      })
      i++
    } else if (trimmed.startsWith("## ")) {
      blocks.push({
        type: "heading",
        level: 2,
        children: parseInline(trimmed.slice(3)),
      })
      i++
    } else if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
        quoteLines.push(lines[i].trimStart().slice(2))
        i++
      }
      blocks.push({
        type: "quote",
        children: parseInline(quoteLines.join(" ")),
      })
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: InlineNode[][] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (t.startsWith("- ") || t.startsWith("* ")) {
          listItems.push(parseInline(t.slice(2)))
          i++
        } else if (t === "") {
          i++
          break
        } else {
          break
        }
      }
      listItems.forEach((item) => {
        blocks.push({ type: "list", children: item })
      })
    } else if (/^\d+\.\s/.test(trimmed)) {
      const listItems: InlineNode[][] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (/^\d+\.\s/.test(t)) {
          listItems.push(parseInline(t.replace(/^\d+\.\s/, "")))
          i++
        } else if (t === "") {
          i++
          break
        } else {
          break
        }
      }
      listItems.forEach((item) => {
        blocks.push({ type: "ordered-list", children: item })
      })
    } else if (trimmed === "") {
      blocks.push({ type: "empty", children: [] })
      i++
    } else {
      blocks.push({
        type: "paragraph",
        children: parseInline(trimmed),
      })
      i++
    }
  }

  return (
    <div className="prose prose-sm max-w-none">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={idx}
                  className="font-heading mb-2 mt-6 text-xl font-semibold text-darkPrimary"
                >
                  {renderInline(block.children)}
                </h2>
              )
            }
            return (
              <h3
                key={idx}
                className="font-heading mb-2 mt-4 text-lg font-medium text-warmAmber"
              >
                {renderInline(block.children)}
              </h3>
            )
          case "list":
            return (
              <ul key={idx} className="mb-2 ml-5 list-disc text-sm text-darkPrimary">
                <li>{renderInline(block.children)}</li>
              </ul>
            )
          case "ordered-list":
            return (
              <ol key={idx} className="mb-2 ml-5 list-decimal text-sm text-darkPrimary">
                <li>{renderInline(block.children)}</li>
              </ol>
            )
          case "code":
            return (
              <pre
                key={idx}
                className="mb-3 overflow-x-auto rounded-lg bg-warmOffWhite p-3 text-sm"
              >
                <code>{block.children[0]?.text}</code>
              </pre>
            )
          case "quote":
            return (
              <blockquote
                key={idx}
                className="mb-3 border-l-3 border-warmAmber py-1 pl-4 text-sm italic text-mutedText"
              >
                {renderInline(block.children)}
              </blockquote>
            )
          case "empty":
            return <div key={idx} className="h-2" />
          default:
            return (
              <p key={idx} className="mb-2 text-sm leading-relaxed text-darkPrimary">
                {renderInline(block.children)}
              </p>
            )
        }
      })}
    </div>
  )
}
