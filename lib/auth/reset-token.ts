import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TOKEN_EXPIRY_HOURS = 1

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) throw new Error("ENCRYPTION_SECRET is not set")
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex")
  }
  return crypto.scryptSync(secret, "reset-token-salt", 32)
}

export function generateResetToken(email: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const expiry = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  const payload = `${email}|${expiry}`

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(payload, "utf8", "hex")
  encrypted += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")

  const combined = `${iv.toString("hex")}:${encrypted}:${tag}`
  return Buffer.from(combined).toString("base64url")
}

export function verifyResetToken(token: string): { email: string } | null {
  try {
    const key = getKey()
    const decoded = Buffer.from(token, "base64url").toString("utf8")
    const parts = decoded.split(":")

    if (parts.length !== 3) return null

    const [ivHex, ciphertext, tagHex] = parts
    const iv = Buffer.from(ivHex, "hex")
    const tag = Buffer.from(tagHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(ciphertext, "hex", "utf8")
    decrypted += decipher.final("utf8")

    const [email, expiryStr] = decrypted.split("|")
    const expiry = Number(expiryStr)

    if (!email || !expiry || Date.now() > expiry) return null

    return { email }
  } catch {
    return null
  }
}
