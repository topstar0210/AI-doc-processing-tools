"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      router.push(`/results/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer text-sm text-zinc-600 hover:text-zinc-900"
        >
          <span className="mb-2 block text-4xl">📄</span>
          <span className="font-medium text-blue-600">Click to select a PDF</span>
          <span className="mt-1 block text-zinc-500">Text-based PDFs only (max 10 MB)</span>
        </label>
        {file && (
          <p className="mt-4 text-sm font-medium text-zinc-800">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing document..." : "Upload & Extract"}
      </button>

      {loading && (
        <p className="text-center text-sm text-zinc-500">
          Extracting text and running AI analysis. This may take a moment.
        </p>
      )}
    </form>
  );
}
