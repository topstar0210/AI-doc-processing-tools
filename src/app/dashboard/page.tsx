import { AppHeader } from "@/components/AppHeader";
import { MultiUploadForm } from "@/components/MultiUploadForm";

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Upload PDFs</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Drop one or many PDFs. The pipeline runs OCR when needed, extracts structured fields,
            and indexes content for chat.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <MultiUploadForm />
        </div>
      </main>
    </div>
  );
}
