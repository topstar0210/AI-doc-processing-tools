import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() ?? "";

    if (!text) {
      throw new Error(
        "No text found in PDF. Scanned documents require OCR (not supported in this MVP)."
      );
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
