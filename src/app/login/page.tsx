import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">AI Doc Processing</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to upload and extract PDF documents</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
