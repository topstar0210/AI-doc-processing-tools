import { chunkPages } from "./chunking";
import { getResult } from "./storage";
import type { DocumentChunk, RetrievedChunk } from "./types";

function scoreChunk(text: string, query: string): number {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2);

  if (terms.length === 0) return 0;

  const lower = text.toLowerCase();
  return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
}

export async function searchDocumentChunksLocal(
  query: string,
  documentIds: string[],
  limit = 8
): Promise<RetrievedChunk[]> {
  const allChunks: RetrievedChunk[] = [];

  for (const documentId of documentIds) {
    const document = await getResult(documentId);
    if (!document) continue;

    const pages =
      document.pages.length > 0
        ? document.pages
        : [{ pageNumber: 1, text: document.extractedText }];

    const chunks = chunkPages(document.id, document.filename, pages);

    for (const chunk of chunks) {
      const score = scoreChunk(chunk.text, query);
      if (score > 0) {
        allChunks.push({ ...chunk, score });
      }
    }
  }

  if (allChunks.length === 0) {
    for (const documentId of documentIds) {
      const document = await getResult(documentId);
      if (!document) continue;

      const pages =
        document.pages.length > 0
          ? document.pages
          : [{ pageNumber: 1, text: document.extractedText }];

      const chunks = chunkPages(document.id, document.filename, pages);
      allChunks.push(...chunks.slice(0, 2).map((chunk) => ({ ...chunk, score: 0.1 })));
    }
  }

  return allChunks.sort((a, b) => b.score - a.score).slice(0, limit);
}
