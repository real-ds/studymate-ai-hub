export interface HistoryItem {
  id: string;
  originalName: string;
  feature: string;
  status: string;
  createdAt: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
}

export interface HistoryDetailResponse {
  id: string;
  fileRecordId: string;
  userId: string;
  feature: string;
  outputJson: Record<string, unknown> | null;
  outputText: string | null;
  pdfUrl: string | null;
  createdAt: string;
  fileRecord: {
    originalName: string;
    fileUrl: string;
    fileType: string;
    feature: string;
    status: string;
  } | null;
}
