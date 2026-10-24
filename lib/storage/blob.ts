import { promises as fs } from "fs"
import path from "path"
import { db } from "@/lib/db"
import { fileStorage } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

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

export async function uploadFile(
  file: File,
  fileName: string
): Promise<{ url: string }> {
  const buffer = await getFileBuffer(file)

  // Try Vercel Blob if token is set
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob")
      const blob = await put(fileName, buffer, { access: "private" })
      return { url: blob.url }
    } catch (err) {
      console.warn("Vercel Blob upload failed:", err)
    }
  }

  // Try storing in PostgreSQL (Neon)
  try {
    const recordId = crypto.randomUUID()
    const base64 = buffer.toString("base64")
    await db.insert(fileStorage).values({
      id: recordId,
      data: base64,
      mimeType: file.type || "application/octet-stream",
    })
    return { url: `db://${recordId}` }
  } catch (err) {
    console.warn("DB storage failed, falling back to local filesystem:", err)
  }

  // Fall back to local storage
  const url = await saveLocally(buffer, fileName)
  return { url }
}

async function saveLocally(buffer: Buffer, fileName: string): Promise<string> {
  await ensureUploadDir()
  const localPath = path.join(UPLOAD_DIR, fileName)
  await fs.writeFile(localPath, buffer)
  return `${getBaseUrl()}/uploads/${fileName}`
}

export async function fetchFile(url: string): Promise<Buffer> {
  // Handle DB-stored files
  if (url.startsWith("db://")) {
    const storageId = url.slice(5)
    const [row] = await db
      .select()
      .from(fileStorage)
      .where(eq(fileStorage.id, storageId))

    if (!row) throw new Error(`File not found in database storage: ${url}`)
    return Buffer.from(row.data, "base64")
  }

  // Handle Vercel Blob
  if (url.includes("blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob")
      const response = await get(url, { access: "private" })
      if (!response?.stream) throw new Error("No stream found on response")
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

  // Handle local or remote URLs
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`)
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("text/html")) {
    throw new Error(`Expected a file but received an HTML page from ${url}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function deleteFile(url: string): Promise<void> {
  // Handle DB-stored files
  if (url.startsWith("db://")) {
    const storageId = url.slice(5)
    try {
      await db.delete(fileStorage).where(eq(fileStorage.id, storageId))
    } catch (err) {
      console.error("Failed to delete from database storage:", err)
    }
    return
  }

  // Handle Vercel Blob
  if (url.includes("blob.vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob")
      await del(url)
      return
    } catch {
      // fall through to local deletion
    }
  }

  // Handle local files
  const fileName = url.split("/").pop()
  if (!fileName) return
  const filePath = path.join(UPLOAD_DIR, fileName)
  try {
    await fs.unlink(filePath)
  } catch {
    // file may not exist
  }
}
