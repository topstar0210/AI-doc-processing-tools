import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getResult, listResults } from "@/lib/storage";
import { reindexAllDocuments } from "@/lib/vector";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summaries = await listResults();
    const documents = [];

    for (const summary of summaries) {
      const document = await getResult(summary.id);
      if (!document) continue;

      const pages =
        document.pages.length > 0
          ? document.pages
          : [{ pageNumber: 1, text: document.extractedText }];

      documents.push({
        id: document.id,
        filename: document.filename,
        pages,
      });
    }

    const chunkCount = await reindexAllDocuments(documents);

    logger.audit("vector.reindex_complete", "Documents reindexed", {
      documentCount: documents.length,
      chunkCount,
    });

    return NextResponse.json({
      documents: documents.length,
      chunksIndexed: chunkCount,
      message:
        chunkCount > 0
          ? "Documents indexed in Qdrant"
          : "Qdrant unavailable — chat will use local search until Qdrant is running",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reindex failed";
    logger.error("vector.reindex_failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
