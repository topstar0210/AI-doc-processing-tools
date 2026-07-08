import type { ExtractionMethod } from "./pdf";

export interface ExtractedDocument {
  id: string;
  filename: string;
  extractedText: string;
  structuredData: Record<string, unknown>;
  createdAt: string;
  extractionMethod?: ExtractionMethod;
}

export interface HistorySummary {
  id: string;
  filename: string;
  createdAt: string;
  extractionMethod?: ExtractionMethod;
  documentType: string | null;
}

export interface ProcessResult {
  id: string;
}
