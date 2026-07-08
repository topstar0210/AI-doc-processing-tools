import { isAuthenticated } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { createChatCompletion } from "@/lib/rag";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      message?: string;
      documentIds?: string[];
      history?: ChatMessage[];
    };

    if (!body.message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    if (!body.documentIds?.length) {
      return new Response(JSON.stringify({ error: "Select at least one document" }), {
        status: 400,
      });
    }

    const { stream, citations } = await createChatCompletion(
      body.message.trim(),
      body.documentIds,
      body.history ?? []
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "citations", citations })}\n\n`)
        );

        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "token", content: delta })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Chat failed";
          logger.error("chat.stream_failed", message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    logger.error("chat.failed", message);
    return new Response(
      JSON.stringify({
        error:
          message.includes("fetch failed") || message.includes("ECONNREFUSED")
            ? "Search service unavailable. Chat is using local document search — restart after starting Qdrant with: docker compose up qdrant -d"
            : message,
      }),
      { status: 500 }
    );
  }
}
