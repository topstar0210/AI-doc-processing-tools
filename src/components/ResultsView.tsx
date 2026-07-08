"use client";

import { structuredDataToCsv } from "@/lib/export";
import type { ExtractedDocument } from "@/lib/types";
import Link from "next/link";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function FieldRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 sm:grid-cols-3">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-zinc-900 sm:col-span-2">{formatValue(value)}</dd>
    </div>
  );
}

export function ResultsView({ result }: { result: ExtractedDocument }) {
  function downloadJson() {
    const blob = new Blob([JSON.stringify(result.structuredData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename.replace(/\.pdf$/i, "")}-extracted.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCsv() {
    const csv = structuredDataToCsv(result.structuredData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename.replace(/\.pdf$/i, "")}-extracted.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Extraction Results</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {result.filename} · {new Date(result.createdAt).toLocaleString()}
            {result.extractionMethod === "ocr" && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                OCR
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadJson}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Download JSON
          </button>
          <button
            onClick={downloadCsv}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Download CSV
          </button>
          <Link
            href="/history"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            History
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Upload another
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Structured Fields</h2>
        <dl>
          {Object.entries(result.structuredData).map(([key, value]) => (
            <FieldRow key={key} label={key.replace(/_/g, " ")} value={value} />
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Extracted Text</h2>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
          {result.extractedText}
        </pre>
      </section>
    </div>
  );
}
