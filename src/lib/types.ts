import type { ExtractionMethod } from "./pdf";

export interface PageText {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  extractedText: string;
  pages: PageText[];
  structuredData: Record<string, unknown>;
  createdAt: string;
  extractionMethod?: ExtractionMethod;
  indexedAt?: string;
  pageCount: number;
}

export interface HistorySummary {
  id: string;
  filename: string;
  createdAt: string;
  extractionMethod?: ExtractionMethod;
  documentType: string | null;
  pageCount: number;
  indexed: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  filename: string;
  pageStart: number;
  pageEnd: number;
  text: string;
}

export interface RetrievedChunk extends DocumentChunk {
  score: number;
}

export interface ChatCitation {
  documentId: string;
  filename: string;
  pageStart: number;
  pageEnd: number;
  excerpt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
}

export interface ExportDocument {
  id: string;
  filename: string;
  createdAt: string;
  extractionMethod: ExtractionMethod | null;
  pageCount: number;
  pages: PageText[];
  structuredData: Record<string, unknown>;
  indexedAt: string | null;
}
