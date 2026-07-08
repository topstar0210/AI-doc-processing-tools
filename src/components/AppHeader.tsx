import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

interface AppHeaderProps {
  active?: "dashboard" | "chat" | "history";
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Upload", key: "dashboard" as const },
  { href: "/chat", label: "Chat", key: "chat" as const },
  { href: "/history", label: "History", key: "history" as const },
];

export function AppHeader({ active }: AppHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
            AI Doc Processing
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active === item.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
