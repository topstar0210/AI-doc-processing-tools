import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { processAndIndexDocument } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 20;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one PDF file is required" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files per upload` }, { status: 400 });
    }

    const documents = [];

    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: `${file.name} is not a PDF` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `${file.name} exceeds 10 MB` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await processAndIndexDocument(buffer, file.name);
      documents.push({
        id: result.id,
        filename: result.filename,
        pageCount: result.pageCount,
        extractionMethod: result.extractionMethod,
      });
    }

    logger.audit("documents.batch_uploaded", "Batch upload completed", {
      count: documents.length,
      documentIds: documents.map((doc) => doc.id),
    });

    return NextResponse.json({ documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    logger.error("documents.upload_failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listResults } = await import("@/lib/storage");
  const results = await listResults();
  return NextResponse.json({ documents: results });
}
