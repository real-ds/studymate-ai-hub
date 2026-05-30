export async function parseTXT(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) throw new Error(`Failed to fetch text file: ${response.statusText}`)
  return response.text()
}
