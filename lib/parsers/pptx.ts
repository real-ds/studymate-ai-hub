import { fetchFile } from "@/lib/storage/blob"

export async function parsePPTX(fileUrl: string): Promise<string> {
  try {
    const buffer = await fetchFile(fileUrl)

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
