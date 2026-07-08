import OpenAI from "openai";
import { logger } from "./logger";
import type { ChatCitation, ChatMessage } from "./types";
import { searchDocumentChunks } from "./vector";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

function formatPageRange(pageStart: number, pageEnd: number) {
  return pageStart === pageEnd ? `p.${pageStart}` : `p.${pageStart}-${pageEnd}`;
}

function buildContextBlock(
  chunks: Awaited<ReturnType<typeof searchDocumentChunks>>
): { context: string; citations: ChatCitation[] } {
  const citations: ChatCitation[] = chunks.map((chunk) => ({
    documentId: chunk.documentId,
    filename: chunk.filename,
    pageStart: chunk.pageStart,
    pageEnd: chunk.pageEnd,
    excerpt: chunk.text.slice(0, 280),
  }));

  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}: ${chunk.filename} ${formatPageRange(chunk.pageStart, chunk.pageEnd)}]\n${chunk.text}`
    )
    .join("\n\n");

  return { context, citations };
}

export async function createChatCompletion(
  message: string,
  documentIds: string[],
  history: ChatMessage[] = []
) {
  const startedAt = Date.now();
  const chunks = await searchDocumentChunks(message, documentIds, 8);
  const { context, citations } = buildContextBlock(chunks);

  const client = getClient();
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a document assistant for legal and finance teams.
Answer only from the supplied excerpts.
Be concise and factual.
Cite every claim using [filename p.X] or [filename p.X-Y].
If the excerpts do not contain the answer, say you could not find it in the selected documents.`,
      },
      ...history.slice(-6).map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
      {
        role: "user",
        content: `Question: ${message}\n\nDocument excerpts:\n${context || "No relevant excerpts found."}`,
      },
    ],
  });

  logger.audit("chat.query", "Chat query processed", {
    documentIds,
    chunkCount: chunks.length,
    durationMs: Date.now() - startedAt,
  });

  return { stream, citations };
}
