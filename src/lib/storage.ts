import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { ExtractedDocument } from "./types";

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
    return JSON.parse(content) as ExtractedDocument;
  } catch {
    return null;
  }
}
