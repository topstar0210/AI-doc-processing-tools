import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "crypto";
import { chunkPages } from "./chunking";
import { EMBEDDING_DIMENSIONS, embedQuery, embedTexts } from "./embeddings";
import { searchDocumentChunksLocal } from "./local-search";
import { logger } from "./logger";
import type { PageText, RetrievedChunk } from "./types";

const COLLECTION = process.env.QDRANT_COLLECTION ?? "documents";

function getClient() {
  const url = process.env.QDRANT_URL ?? "http://127.0.0.1:6333";
  return new QdrantClient({ url, checkCompatibility: false });
}

async function isQdrantAvailable(): Promise<boolean> {
  try {
    const client = getClient();
    await client.getCollections();
    return true;
  } catch {
    return false;
  }
}

async function ensureCollection(client: QdrantClient) {
  const collections = await client.getCollections();
  const exists = collections.collections.some((collection) => collection.name === COLLECTION);

  if (!exists) {
    await client.createCollection(COLLECTION, {
      vectors: {
        size: EMBEDDING_DIMENSIONS,
        distance: "Cosine",
      },
    });
    logger.info("vector.collection_created", `Created Qdrant collection ${COLLECTION}`);
  }
}

export async function indexDocumentPages(
  documentId: string,
  filename: string,
  pages: PageText[]
): Promise<number> {
  const available = await isQdrantAvailable();
  if (!available) {
    logger.warn(
      "vector.qdrant_unavailable",
      "Qdrant not reachable — document saved locally; chat will use local search fallback"
    );
    return 0;
  }

  const client = getClient();
  await ensureCollection(client);

  const chunks = chunkPages(documentId, filename, pages);
  if (chunks.length === 0) return 0;

  const vectors = await embedTexts(chunks.map((chunk) => chunk.text));
  const startedAt = Date.now();

  await client.upsert(COLLECTION, {
    wait: true,
    points: chunks.map((chunk, index) => ({
      id: randomUUID(),
      vector: vectors[index],
      payload: {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        filename: chunk.filename,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        text: chunk.text,
      },
    })),
  });

  logger.info("vector.document_indexed", "Document indexed for retrieval", {
    documentId,
    filename,
    chunkCount: chunks.length,
    durationMs: Date.now() - startedAt,
  });

  return chunks.length;
}

async function searchWithQdrant(
  query: string,
  documentIds: string[],
  limit: number
): Promise<RetrievedChunk[]> {
  const client = getClient();
  await ensureCollection(client);

  const startedAt = Date.now();
  const vector = await embedQuery(query);

  const results = await client.search(COLLECTION, {
    vector,
    limit,
    with_payload: true,
    filter: {
      must: [
        {
          key: "documentId",
          match: { any: documentIds },
        },
      ],
    },
  });

  logger.info("vector.search_complete", "Vector search completed", {
    documentIds,
    resultCount: results.length,
    durationMs: Date.now() - startedAt,
  });

  return results.map((result) => {
    const payload = result.payload as Record<string, unknown>;
    return {
      id: String(payload.chunkId),
      documentId: String(payload.documentId),
      filename: String(payload.filename),
      pageStart: Number(payload.pageStart),
      pageEnd: Number(payload.pageEnd),
      text: String(payload.text),
      score: result.score ?? 0,
    };
  });
}

export async function searchDocumentChunks(
  query: string,
  documentIds: string[],
  limit = 8
): Promise<RetrievedChunk[]> {
  if (documentIds.length === 0) return [];

  const available = await isQdrantAvailable();
  if (!available) {
    logger.warn("vector.qdrant_unavailable", "Using local search fallback");
    return searchDocumentChunksLocal(query, documentIds, limit);
  }

  try {
    const results = await searchWithQdrant(query, documentIds, limit);
    if (results.length > 0) {
      return results;
    }
    return searchDocumentChunksLocal(query, documentIds, limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vector search failed";
    logger.warn("vector.search_failed", message);
    return searchDocumentChunksLocal(query, documentIds, limit);
  }
}

export async function reindexAllDocuments(
  documents: { id: string; filename: string; pages: PageText[] }[]
): Promise<number> {
  let total = 0;
  for (const document of documents) {
    total += await indexDocumentPages(document.id, document.filename, document.pages);
  }
  return total;
}
