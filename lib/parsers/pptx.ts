export async function parsePPTX(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl)
    if (!response.ok) throw new Error(`Failed to fetch PPTX: ${response.statusText}`)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(buffer)
    const slideFiles = Object.keys(zip.files).filter((name) =>
      name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
    ).sort()

    let text = ""
    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async("string")
      const textMatch = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g)
      if (textMatch) {
        const slideText = textMatch.map((t) =>
          t.replace(/<\/?a:t[^>]*>/g, "")
        ).join(" ")
        text += slideText.trim() + "\n\n"
      }
    }

    return text.trim() || "Could not extract text from PPTX"
  } catch {
    return "Could not extract text from PPTX"
  }
}
