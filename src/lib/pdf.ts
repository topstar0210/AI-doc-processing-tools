import { PDFParse } from "pdf-parse";
import { extractPagesWithOcr } from "./ocr";
import type { PageText } from "./types";

const MIN_TEXT_LENGTH = 40;

export type ExtractionMethod = "text" | "ocr";

export interface PdfExtractionResult {
  pages: PageText[];
  text: string;
  method: ExtractionMethod;
}

function pagesToText(pages: PageText[]): string {
  return pages.map((page) => `[Page ${page.pageNumber}]\n${page.text}`).join("\n\n");
}

export async function extractPagesFromPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const pages = result.pages
      .map((page) => ({
        pageNumber: page.num,
        text: page.text.trim(),
      }))
      .filter((page) => page.text.length > 0);

    const text = result.text?.trim() ?? "";

    if (text.length >= MIN_TEXT_LENGTH && pages.length > 0) {
      return { pages, text, method: "text" };
    }

    const ocrPages = await extractPagesWithOcr(parser);
    if (ocrPages.length === 0) {
      throw new Error("No text could be extracted from this PDF.");
    }

    return {
      pages: ocrPages,
      text: pagesToText(ocrPages),
      method: "ocr",
    };
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  return extractPagesFromPdf(buffer);
}
