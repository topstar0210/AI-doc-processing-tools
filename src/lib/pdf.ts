import { PDFParse } from "pdf-parse";
import { extractTextWithOcr } from "./ocr";

const MIN_TEXT_LENGTH = 40;

export type ExtractionMethod = "text" | "ocr";

export interface PdfExtractionResult {
  text: string;
  method: ExtractionMethod;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";

    if (text.length >= MIN_TEXT_LENGTH) {
      return { text, method: "text" };
    }

    const ocrText = await extractTextWithOcr(parser);
    if (!ocrText.trim()) {
      throw new Error("No text could be extracted from this PDF.");
    }

    return { text: ocrText, method: "ocr" };
  } finally {
    await parser.destroy();
  }
}
