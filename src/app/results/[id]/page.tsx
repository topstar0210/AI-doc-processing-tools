import { ResultsView } from "@/components/ResultsView";
import { LogoutButton } from "@/components/LogoutButton";
import { getResult } from "@/lib/storage";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
            AI Doc Processing
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <ResultsView result={result} />
      </main>
    </div>
  );
}
