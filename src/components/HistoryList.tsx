import Link from "next/link";
import type { HistorySummary } from "@/lib/types";

function MethodBadge({ method }: { method?: HistorySummary["extractionMethod"] }) {
  if (!method) return null;

  const isOcr = method === "ocr";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isOcr ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {isOcr ? "OCR" : "Text"}
    </span>
  );
}

export function HistoryList({ results }: { results: HistorySummary[] }) {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <p className="text-zinc-500">No documents processed yet.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Upload your first PDF
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <ul className="divide-y divide-zinc-100">
        {results.map((result) => (
          <li key={result.id}>
            <Link
              href={`/results/${result.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-zinc-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{result.filename}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {new Date(result.createdAt).toLocaleString()}
                  {result.documentType ? ` · ${result.documentType}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MethodBadge method={result.extractionMethod} />
                <span className="text-sm font-medium text-blue-600">View →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
