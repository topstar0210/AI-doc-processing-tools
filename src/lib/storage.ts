import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { ExportDocument, ExtractedDocument, HistorySummary } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const RESULTS_DIR = path.join(DATA_DIR, "results");

async function ensureDirs() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(RESULTS_DIR, { recursive: true });
}

export async function savePdf(buffer: Buffer, originalFilename: string): Promise<string> {
  await ensureDirs();
  const id = randomUUID();
  const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(UPLOADS_DIR, `${id}_${safeName}`);
  await writeFile(filePath, buffer);
  return id;
}

export async function saveResult(result: ExtractedDocument): Promise<void> {
  await ensureDirs();
  const filePath = path.join(RESULTS_DIR, `${result.id}.json`);
  await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");
}

export async function getResult(id: string): Promise<ExtractedDocument | null> {
  try {
    const filePath = path.join(RESULTS_DIR, `${id}.json`);
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as ExtractedDocument;
    return {
      ...parsed,
      pages: parsed.pages ?? [],
      pageCount: parsed.pageCount ?? parsed.pages?.length ?? 0,
    };
  } catch {
    return null;
  }
}

export function toExportDocument(result: ExtractedDocument): ExportDocument {
  return {
    id: result.id,
    filename: result.filename,
    createdAt: result.createdAt,
    extractionMethod: result.extractionMethod ?? null,
    pageCount: result.pageCount,
    pages: result.pages,
    structuredData: result.structuredData,
    indexedAt: result.indexedAt ?? null,
  };
}

function toHistorySummary(result: ExtractedDocument): HistorySummary {
  const documentType = result.structuredData.document_type;
  return {
    id: result.id,
    filename: result.filename,
    createdAt: result.createdAt,
    extractionMethod: result.extractionMethod,
    documentType: typeof documentType === "string" ? documentType : null,
    pageCount: result.pageCount,
    indexed: Boolean(result.indexedAt),
  };
}

export async function listResults(): Promise<HistorySummary[]> {
  await ensureDirs();

  const files = await readdir(RESULTS_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  const results = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const content = await readFile(path.join(RESULTS_DIR, file), "utf-8");
        return JSON.parse(content) as ExtractedDocument;
      } catch {
        return null;
      }
    })
  );

  return results
    .filter((result): result is ExtractedDocument => result !== null)
    .map(toHistorySummary)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
