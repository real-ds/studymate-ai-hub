export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountRow {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface SessionRow {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationTokenRow {
  identifier: string;
  token: string;
  expires: Date;
}

export interface ApiKeyRow {
  id: string;
  userId: string;
  provider: string;
  encryptedKey: string;
  label: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileRecordRow {
  id: string;
  userId: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  feature: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
}

export interface SessionsOutputRow {
  id: string;
  fileRecordId: string | null;
  userId: string;
  feature: string;
  outputJson: Record<string, unknown> | null;
  outputText: string | null;
  pdfUrl: string | null;
  createdAt: Date;
}
