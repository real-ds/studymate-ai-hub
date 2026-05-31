import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Flashcard, QuizQuestion, MindMapNode } from "@/types/feature.types"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1C1C1E",
  },
  h1: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#C8A96E",
  },
  h2: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  h3: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#C8A96E",
  },
  p: {
    marginBottom: 6,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 12,
  },
  bullet: {
    width: 12,
  },
  listText: {
    flex: 1,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#C8A96E",
    paddingLeft: 12,
    marginVertical: 6,
    color: "#6B6B6B",
    fontStyle: "italic",
  },
  codeBlock: {
    backgroundColor: "#FAF8F4",
    borderWidth: 1,
    borderColor: "#E5E0D6",
    borderRadius: 4,
    padding: 10,
    fontFamily: "Courier",
    fontSize: 9,
    marginVertical: 6,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#C8A96E",
    borderRadius: 4,
    marginBottom: 8,
  },
  cardFront: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E0D6",
    fontWeight: "bold",
    fontSize: 10,
  },
  cardBack: {
    padding: 8,
    backgroundColor: "#FAF8F4",
    fontSize: 10,
  },
  cardNumber: {
    backgroundColor: "#C8A96E",
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    borderRadius: 9,
    width: 16,
    height: 16,
    textAlign: "center",
    lineHeight: 16,
    marginRight: 4,
  },
  question: {
    borderWidth: 1,
    borderColor: "#E5E0D6",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  qText: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  option: {
    padding: 4,
    fontSize: 10,
    marginBottom: 2,
  },
  correctOption: {
    backgroundColor: "#E8F5E9",
    fontWeight: "bold",
  },
  explanation: {
    fontSize: 10,
    color: "#6B6B6B",
    borderTopWidth: 1,
    borderTopColor: "#E5E0D6",
    paddingTop: 6,
    marginTop: 6,
  },
  mindMapNode: {
    marginBottom: 4,
  },
  mindMapChildren: {
    paddingLeft: 20,
  },
  mindMapDetail: {
    fontSize: 10,
    color: "#6B6B6B",
    paddingLeft: 10,
    marginBottom: 4,
  },
  revisionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  revisionColumn: {
    width: "50%",
    paddingRight: 10,
  },
  h4: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    color: "#1C1C1E",
  },
  table: {
    width: "100%",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E0D6",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E0D6",
    minHeight: 20,
  },
  tableHeaderRow: {
    backgroundColor: "#FAF8F4",
  },
  tableCellContainer: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#E5E0D6",
  },
  tableCell: {
    fontSize: 8,
    color: "#1C1C1E",
  },
  tableHeaderCell: {
    fontWeight: "bold",
  },
})

function renderFormattedText(text: string, baseStyle?: any): React.ReactNode {
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // Bold
      parts.push(<Text key={key++} style={{ fontWeight: "bold" }}>{match[2]}</Text>)
    } else if (match[3]) {
      // Italic
      parts.push(<Text key={key++} style={{ fontStyle: "italic" }}>{match[3]}</Text>)
    } else if (match[4]) {
      // Inline code
      parts.push(
        <Text
          key={key++}
          style={{
            fontFamily: "Courier",
            backgroundColor: "#FAF8F4",
            paddingHorizontal: 2,
          }}
        >
          {match[4]}
        </Text>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <Text style={baseStyle}>{parts}</Text>
}

function renderTablePdf(rows: string[][], key: number): React.ReactNode {
  const headers = rows[0] || []
  const dataRows = rows.slice(1)

  return (
    <View key={key} style={styles.table} wrap={false}>
      {/* Header Row */}
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headers.map((cell, idx) => (
          <View
            key={idx}
            style={[
              styles.tableCellContainer,
              idx === headers.length - 1 ? { borderRightWidth: 0 } : {},
            ]}
          >
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>
              {cell}
            </Text>
          </View>
        ))}
      </View>
      {/* Data Rows */}
      {dataRows.map((row, rIdx) => (
        <View
          key={rIdx}
          style={[
            styles.tableRow,
            rIdx % 2 === 1 ? { backgroundColor: "#FAF8F4" } : {},
            rIdx === dataRows.length - 1 ? { borderBottomWidth: 0 } : {},
          ]}
        >
          {row.map((cell, cIdx) => (
            <View
              key={cIdx}
              style={[
                styles.tableCellContainer,
                cIdx === row.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              <Text style={styles.tableCell}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

function parseMarkdownToPdf(md: string): React.ReactNode[] {
  const lines = md.split("\n")
  const nodes: React.ReactNode[] = []
  let inCode = false
  let codeBuffer: string[] = []
  let inTable = false
  let tableRows: string[][] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trimStart()

    // 1. Handle Code Blocks
    if (trimmed.startsWith("```")) {
      if (inCode) {
        nodes.push(
          <View key={key++} style={styles.codeBlock}>
            <Text>{codeBuffer.join("\n")}</Text>
          </View>
        )
        codeBuffer = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }

    if (inCode) {
      codeBuffer.push(raw)
      continue
    }

    // 2. Handle Tables
    if (trimmed.startsWith("|")) {
      inTable = true
      const cells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)

      const isSeparator = cells.every((cell) => /^-+$/.test(cell) || cell === "")
      if (!isSeparator) {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      if (tableRows.length > 0) {
        nodes.push(renderTablePdf(tableRows, key++))
      }
      tableRows = []
      inTable = false
    }

    // 3. Handle Regular Markdown
    if (trimmed.startsWith("#### ")) {
      nodes.push(renderFormattedText(trimmed.slice(5), styles.h4))
    } else if (trimmed.startsWith("### ")) {
      nodes.push(renderFormattedText(trimmed.slice(4), styles.h3))
    } else if (trimmed.startsWith("## ")) {
      nodes.push(renderFormattedText(trimmed.slice(3), styles.h2))
    } else if (trimmed.startsWith("> ")) {
      nodes.push(
        <View key={key++} style={styles.blockquote}>
          {renderFormattedText(trimmed.slice(2))}
        </View>
      )
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      nodes.push(
        <View key={key++} style={styles.listItem}>
          <Text style={styles.bullet}>{"\u2022"}</Text>
          {renderFormattedText(trimmed.slice(2), styles.listText)}
        </View>
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\.\s(.*)/)
      if (num) {
        nodes.push(
          <View key={key++} style={styles.listItem}>
            <Text style={styles.bullet}>{num[1]}.</Text>
            {renderFormattedText(num[2], styles.listText)}
          </View>
        )
      }
    } else if (trimmed === "") {
      // blank line
    } else {
      nodes.push(renderFormattedText(trimmed, styles.p))
    }
  }

  // Handle trailing table or code block
  if (inTable && tableRows.length > 0) {
    nodes.push(renderTablePdf(tableRows, key++))
  }
  if (inCode && codeBuffer.length > 0) {
    nodes.push(
      <View key={key++} style={styles.codeBlock}>
        <Text>{codeBuffer.join("\n")}</Text>
      </View>
    )
  }

  return nodes
}

export function NotesPDF({ content }: { content: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Study Notes</Text>
        {parseMarkdownToPdf(content)}
      </Page>
    </Document>
  )
}

export function FlashcardsPDF({ cards }: { cards: Flashcard[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Flashcards</Text>
        <View style={styles.cardGrid}>
          {cards.map((card, i) => (
            <View key={i} style={styles.card} wrap={false}>
              <View style={styles.cardFront}>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Text style={{ color: "#C8A96E", fontWeight: "bold", width: 22, fontSize: 10 }}>{i + 1}.</Text>
                  <Text style={{ flex: 1, fontWeight: "bold", fontSize: 10, color: "#1C1C1E" }}>{card.front}</Text>
                </View>
              </View>
              <View style={styles.cardBack}>
                <Text>{card.back}</Text>
                {card.category && (
                  <Text style={{ fontSize: 8, color: "#6B6B6B", fontStyle: "italic", marginTop: 4 }}>
                    {card.category}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export function QuizPDF({ questions }: { questions: QuizQuestion[] }) {
  const labels = ["A", "B", "C", "D"]
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Practice Quiz</Text>
        <Text style={{ marginBottom: 16, padding: 8, backgroundColor: "#FAF8F4", borderRadius: 4 }}>
          Total Questions: {questions.length}
        </Text>
        {questions.map((q, i) => (
          <View key={i} style={styles.question} wrap={false}>
            <Text style={styles.qText}>{i + 1}. {q.question}</Text>
            {q.options.map((opt, oi) => (
            <View key={oi} style={opt === q.correct ? [styles.option, styles.correctOption] : styles.option}>
              <Text>{labels[oi]}. {opt}{opt === q.correct ? " \u2713" : ""}</Text>
              </View>
            ))}
            <View style={styles.explanation}>
              <Text><Text style={{ fontWeight: "bold" }}>Explanation:</Text> {q.explanation}</Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}

function renderMindMapNodePDF(node: MindMapNode, depth: number = 0): React.ReactNode {
  const indent = depth * 16
  return (
    <View key={node.id}>
      <View style={{ paddingLeft: indent, marginBottom: 2 }}>
        <Text style={{ fontWeight: depth === 0 ? "bold" : "normal", fontSize: depth === 0 ? 13 : 11 }}>
          {node.label}
        </Text>
      </View>
      {node.detail && (
        <View style={[styles.mindMapDetail, { paddingLeft: indent + 8 }]}>
          <Text>{node.detail}</Text>
        </View>
      )}
      {node.children?.length > 0 && (
        <View>
          {node.children.map((child) => renderMindMapNodePDF(child, depth + 1))}
        </View>
      )}
    </View>
  )
}

export function MindMapPDF({ root }: { root: MindMapNode }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Mind Map</Text>
        {renderMindMapNodePDF(root)}
      </Page>
    </Document>
  )
}

export function RevisionPDF({ content }: { content: string }) {
  const children = parseMarkdownToPdf(content)
  const midpoint = Math.ceil(children.length / 2)
  const leftCol = children.slice(0, midpoint)
  const rightCol = children.slice(midpoint)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Revision Notes</Text>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "50%", paddingRight: 8 }}>
            {leftCol.map((child, i) => (
              <View key={i}>{child}</View>
            ))}
          </View>
          <View style={{ width: "50%", paddingLeft: 8 }}>
            {rightCol.map((child, i) => (
              <View key={i}>{child}</View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
