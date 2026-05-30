const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [
  ".pdf", ".pptx", ".docx", ".txt",
  ".jpg", ".jpeg", ".png", ".webp",
];

export function validateFileType(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function validateFileSize(file: File, maxSizeMB: number = 25): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const API_KEY_PATTERNS: Record<string, RegExp> = {
  gemini: /^AIza[0-9A-Za-z_-]{35,}$/,
  openai: /^sk-[0-9A-Za-z]{20,}$/,
  anthropic: /^sk-ant-[0-9A-Za-z]{20,}$/,
};

export function validateApiKeyFormat(provider: string, key: string): boolean {
  const pattern = API_KEY_PATTERNS[provider.toLowerCase()];
  if (!pattern) return false;
  return pattern.test(key);
}
