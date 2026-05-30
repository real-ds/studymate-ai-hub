export interface UploadResponse {
  fileRecordId: string;
  fileUrl: string;
}

export interface FeatureRequest {
  fileRecordId: string;
  options?: {
    count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    mode?: 'compact' | 'detailed';
  };
}

export interface HistoryEntry {
  id: string;
  originalName: string;
  feature: string;
  status: string;
  createdAt: string;
  fileType: string;
}

export interface ProfileResponse {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  stats: {
    totalFiles: number;
    totalSessions: number;
  };
}

export interface ApiKeyResponse {
  id: string;
  provider: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  keyMasked: string;
}
