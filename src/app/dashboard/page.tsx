import { LogoutButton } from "@/components/LogoutButton";
import { UploadForm } from "@/components/UploadForm";

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-zinc-900">AI Doc Processing</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Upload PDF</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Upload a text-based PDF to extract content and parse structured fields with AI.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <UploadForm />
        </div>
      </main>
    </div>
  );
}
