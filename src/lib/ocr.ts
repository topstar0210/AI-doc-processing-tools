import { createWorker } from "tesseract.js";
import type { PDFParse } from "pdf-parse";

const MAX_OCR_PAGES = 15;

export async function extractTextWithOcr(parser: PDFParse): Promise<string> {
  const screenshot = await parser.getScreenshot({ scale: 2 });
  const pages = screenshot.pages.slice(0, MAX_OCR_PAGES);

  if (pages.length === 0) {
    return "";
  }

  const worker = await createWorker("eng");

  try {
    const pageTexts: string[] = [];

    for (const page of pages) {
      const {
        data: { text },
      } = await worker.recognize(Buffer.from(page.data));
      const trimmed = text.trim();
      if (trimmed) {
        pageTexts.push(`[Page ${page.pageNumber}]\n${trimmed}`);
      }
    }

    return pageTexts.join("\n\n");
  } finally {
    await worker.terminate();
  }
}
