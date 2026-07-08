"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MultiUploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(selected: FileList | null) {
    if (!selected) return;
    setFiles(Array.from(selected));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one PDF");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      if (data.documents?.length === 1) {
        router.push(`/results/${data.documents[0].id}`);
        return;
      }

      router.push("/chat");
      router.refresh();
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
          multiple
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer text-sm text-zinc-600 hover:text-zinc-900"
        >
          <span className="mb-2 block text-4xl">📄</span>
          <span className="font-medium text-blue-600">Drop one or many PDFs here</span>
          <span className="mt-1 block text-zinc-500">
            Text-based or scanned PDFs, up to 20 files / 10 MB each
          </span>
        </label>
        {files.length > 0 && (
          <ul className="mt-4 space-y-1 text-left text-sm text-zinc-800">
            {files.map((file) => (
              <li key={file.name}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={files.length === 0 || loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing and indexing..." : "Upload & Index"}
      </button>

      {loading && (
        <p className="text-center text-sm text-zinc-500">
          Running OCR where needed, extracting fields, and building vector embeddings for chat.
        </p>
      )}
    </form>
  );
}
