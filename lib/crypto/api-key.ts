import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set")
  }
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex")
  }
  return crypto.scryptSync(secret, "studymate-salt", 32)
}

export function encryptApiKey(apiKey: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(apiKey, "utf8", "hex")
  encrypted += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")

  return `${iv.toString("hex")}:${encrypted}:${tag}`
}

export function decryptApiKey(encrypted: string): string {
  const key = getKey()
  const parts = encrypted.split(":")

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted key format")
  }

  const [ivHex, ciphertext, tagHex] = parts
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(ciphertext, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export const encrypt = encryptApiKey;
export const decrypt = decryptApiKey;
