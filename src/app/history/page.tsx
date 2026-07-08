import { AppHeader } from "@/components/AppHeader";
import { HistoryList } from "@/components/HistoryList";
import { listResults } from "@/lib/storage";

export default async function HistoryPage() {
  const results = await listResults();

  return (
    <div className="min-h-full bg-zinc-50">
      <AppHeader active="history" />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Upload History</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Browse past extractions and re-download results.
          </p>
        </div>

        <HistoryList results={results} />
      </main>
    </div>
  );
}
