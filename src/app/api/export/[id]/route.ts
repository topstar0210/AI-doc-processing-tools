import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getResult, toExportDocument } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  logger.audit("export.json", "Document exported", { documentId: id });

  return NextResponse.json(toExportDocument(result), {
    headers: {
      "Content-Disposition": `attachment; filename="${result.filename.replace(/\.pdf$/i, "")}.json"`,
    },
  });
}
