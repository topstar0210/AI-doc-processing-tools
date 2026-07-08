import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listResults } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await listResults();
  return NextResponse.json({ results });
}
