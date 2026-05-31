import { promises as fs } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000"
}

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch {
    // directory exists
  }
}

async function getFileBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function saveLocally(buffer: Buffer, fileName: string): Promise<string> {
  await ensureUploadDir()
  const localPath = path.join(UPLOAD_DIR, fileName)
  await fs.writeFile(localPath, buffer)
  return `${getBaseUrl()}/uploads/${fileName}`
}

export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string }> {
  const buffer = await getFileBuffer(file)

  // Try Vercel Blob if token is set, fall back to local storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob")
      const blob = await put(fileName, buffer, { access: "private" })
      return { url: blob.url }
    } catch (err) {
      console.warn("Vercel Blob upload failed, falling back to local storage:", err)
    }
  }

  const url = await saveLocally(buffer, fileName)
  return { url }
}

export async function fetchFile(url: string): Promise<Buffer> {
  if (url.includes("blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob")
      const response = await get(url, { access: "private" })
      const chunks: Uint8Array[] = []
      const reader = response.stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      return Buffer.concat(chunks.map(c => Buffer.from(c)))
    } catch (err) {
      console.warn("Vercel Blob fetch failed, falling back to network fetch:", err)
    }
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function deleteFile(url: string): Promise<void> {
  if (url.includes("blob.vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob")
      await del(url)
      return
    } catch {
      // fall through to local deletion
    }
  }

  const fileName = url.split("/").pop()
  if (!fileName) return
  const filePath = path.join(UPLOAD_DIR, fileName)
  try {
    await fs.unlink(filePath)
  } catch {
    // file may not exist
  }
}
