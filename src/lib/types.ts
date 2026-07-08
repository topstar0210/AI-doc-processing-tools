export interface ExtractedDocument {
  id: string;
  filename: string;
  extractedText: string;
  structuredData: Record<string, unknown>;
  createdAt: string;
}

export interface ProcessResult {
  id: string;
}
