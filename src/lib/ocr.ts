import { createWorker } from "tesseract.js";
import type { PDFParse } from "pdf-parse";
import type { PageText } from "./types";

const MAX_OCR_PAGES = Number(process.env.OCR_MAX_PAGES ?? "100");

export async function extractPagesWithOcr(parser: PDFParse): Promise<PageText[]> {
  const screenshot = await parser.getScreenshot({ scale: 2 });
  const pages = screenshot.pages.slice(0, MAX_OCR_PAGES);

  if (pages.length === 0) {
    return [];
  }

  const worker = await createWorker("eng");

  try {
    const pageTexts: PageText[] = [];

    for (const page of pages) {
      const {
        data: { text },
      } = await worker.recognize(Buffer.from(page.data));
      const trimmed = text.trim();
      if (trimmed) {
        pageTexts.push({
          pageNumber: page.pageNumber,
          text: trimmed,
        });
      }
    }

    return pageTexts;
  } finally {
    await worker.terminate();
  }
}

export async function extractTextWithOcr(parser: PDFParse): Promise<string> {
  const pages = await extractPagesWithOcr(parser);
  return pages.map((page) => `[Page ${page.pageNumber}]\n${page.text}`).join("\n\n");
}
