import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { extractStructuredData } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { getResult, savePdf, saveResult } from "@/lib/storage";
import type { ExtractedDocument } from "@/lib/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be 10 MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text: extractedText, method: extractionMethod } = await extractTextFromPdf(buffer);
    const structuredData = await extractStructuredData(extractedText);
    const id = await savePdf(buffer, file.name);

    const result: ExtractedDocument = {
      id,
      filename: file.name,
      extractedText,
      structuredData,
      createdAt: new Date().toISOString(),
      extractionMethod,
    };

    await saveResult(result);

    return NextResponse.json({ id: result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Result id is required" }, { status: 400 });
  }

  const result = await getResult(id);
  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
