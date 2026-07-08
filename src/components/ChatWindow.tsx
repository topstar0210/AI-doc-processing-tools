"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChatCitation, ChatMessage, HistorySummary } from "@/lib/types";

function formatPageRange(pageStart: number, pageEnd: number) {
  return pageStart === pageEnd ? `p. ${pageStart}` : `p. ${pageStart}-${pageEnd}`;
}

function CitationList({ citations }: { citations: ChatCitation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Sources</p>
      {citations.map((citation, index) => (
        <Link
          key={`${citation.documentId}-${citation.pageStart}-${index}`}
          href={`/results/${citation.documentId}#page-${citation.pageStart}`}
          className="block rounded-lg bg-zinc-50 px-3 py-2 text-sm transition hover:bg-blue-50"
        >
          <span className="font-medium text-blue-700">
            {citation.filename} · {formatPageRange(citation.pageStart, citation.pageEnd)}
          </span>
          <span className="mt-1 block line-clamp-2 text-zinc-600">{citation.excerpt}</span>
        </Link>
      ))}
    </div>
  );
}

export function ChatWindow({ documents }: { documents: HistorySummary[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documents.length > 0 && selectedIds.length === 0) {
      setSelectedIds(documents.map((doc) => doc.id));
    }
  }, [documents, selectedIds.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function toggleDocument(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((docId) => docId !== id) : [...current, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    if (selectedIds.length === 0) {
      setError("Select at least one document to chat with.");
      return;
    }

    const question = input.trim();
    setInput("");
    setError("");
    setLoading(true);

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          documentIds: selectedIds,
          history: messages,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let citations: ChatCitation[] = [];

      setMessages((current) => [...current, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const payload = JSON.parse(line.slice(6)) as {
            type: string;
            content?: string;
            citations?: ChatCitation[];
            message?: string;
          };

          if (payload.type === "citations" && payload.citations) {
            citations = payload.citations;
          }

          if (payload.type === "token" && payload.content) {
            assistantText += payload.content;
            setMessages((current) => {
              const next = [...current];
              next[next.length - 1] = {
                role: "assistant",
                content: assistantText,
                citations,
              };
              return next;
            });
          }

          if (payload.type === "error") {
            throw new Error(payload.message ?? "Chat failed");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages((current) => current.filter((message) => message.content.length > 0));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Documents in chat</h3>
        <p className="mt-1 text-xs text-zinc-500">Select which uploaded PDFs to query.</p>
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
          {documents.length === 0 ? (
            <p className="text-sm text-zinc-500">Upload PDFs first to start chatting.</p>
          ) : (
            documents.map((doc) => (
              <label
                key={doc.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-100 px-3 py-2 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(doc.id)}
                  onChange={() => toggleDocument(doc.id)}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-900">
                    {doc.filename}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {doc.pageCount} pages · {doc.indexed ? "indexed" : "not indexed"}
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[360px] items-center justify-center text-center">
              <div>
                <p className="text-lg font-medium text-zinc-900">Chat with your documents</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Ask questions in plain English. Answers cite the exact page ranges and link back
                  to the source.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-50 text-zinc-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && message.citations && (
                    <CitationList citations={message.citations} />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-4">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dates, parties, amounts, clauses..."
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-blue-500 focus:ring-2"
              disabled={loading || documents.length === 0}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || documents.length === 0}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
