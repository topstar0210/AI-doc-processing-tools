import { randomUUID } from "crypto";
import type { DocumentChunk, PageText } from "./types";

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;

export function chunkPages(
  documentId: string,
  filename: string,
  pages: PageText[]
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  for (const page of pages) {
    if (page.text.length <= CHUNK_SIZE) {
      chunks.push({
        id: randomUUID(),
        documentId,
        filename,
        pageStart: page.pageNumber,
        pageEnd: page.pageNumber,
        text: page.text,
      });
      continue;
    }

    let offset = 0;
    while (offset < page.text.length) {
      const slice = page.text.slice(offset, offset + CHUNK_SIZE);
      chunks.push({
        id: randomUUID(),
        documentId,
        filename,
        pageStart: page.pageNumber,
        pageEnd: page.pageNumber,
        text: slice,
      });
      offset += CHUNK_SIZE - CHUNK_OVERLAP;
    }
  }

  return chunks;
}
