import { extractStructuredData } from "./openai";
import { extractPagesFromPdf } from "./pdf";
import { logger } from "./logger";
import { savePdf, saveResult } from "./storage";
import type { ExtractedDocument } from "./types";
import { indexDocumentPages } from "./vector";

export async function processAndIndexDocument(
  buffer: Buffer,
  filename: string
): Promise<ExtractedDocument> {
  const startedAt = Date.now();
  const { pages, text, method } = await extractPagesFromPdf(buffer);
  const structuredData = await extractStructuredData(text);
  const id = await savePdf(buffer, filename);
  const indexedAt = new Date().toISOString();

  await indexDocumentPages(id, filename, pages);

  const result: ExtractedDocument = {
    id,
    filename,
    extractedText: text,
    pages,
    structuredData,
    createdAt: indexedAt,
    extractionMethod: method,
    indexedAt,
    pageCount: pages.length,
  };

  await saveResult(result);

  logger.audit("document.processed", "Document processed and indexed", {
    documentId: id,
    filename,
    pageCount: pages.length,
    extractionMethod: method,
    durationMs: Date.now() - startedAt,
  });

  return result;
}
