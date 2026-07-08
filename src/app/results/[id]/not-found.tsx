import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Result not found</h1>
        <p className="mt-2 text-sm text-zinc-500">This extraction result may have expired or does not exist.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
