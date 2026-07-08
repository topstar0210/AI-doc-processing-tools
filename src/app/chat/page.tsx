import { AppHeader } from "@/components/AppHeader";
import { ChatWindow } from "@/components/ChatWindow";
import { listResults } from "@/lib/storage";

export default async function ChatPage() {
  const documents = await listResults();

  return (
    <div className="min-h-full bg-zinc-50">
      <AppHeader active="chat" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Chat with Documents</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Ask questions across your uploaded PDFs and jump straight to cited page ranges.
          </p>
        </div>

        <ChatWindow documents={documents} />
      </main>
    </div>
  );
}
