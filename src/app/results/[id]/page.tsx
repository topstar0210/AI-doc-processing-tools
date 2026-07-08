import { AppHeader } from "@/components/AppHeader";
import { ResultsView } from "@/components/ResultsView";
import { getResult } from "@/lib/storage";
import { notFound } from "next/navigation";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <ResultsView result={result} />
      </main>
    </div>
  );
}
