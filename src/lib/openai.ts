import OpenAI from "openai";

const EXTRACTION_SCHEMA = {
  document_type: "Type of document (invoice, contract, report, letter, etc.)",
  title: "Document title or subject",
  date: "Primary date mentioned (ISO format if possible, otherwise as written)",
  parties: "People or organizations mentioned",
  key_fields: "Important named fields as key-value pairs",
  amounts: "Monetary amounts with currency if present",
  summary: "Brief summary of the document in 2-3 sentences",
};

export async function extractStructuredData(text: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You extract structured data from documents. Return valid JSON with these fields:
${JSON.stringify(EXTRACTION_SCHEMA, null, 2)}

Rules:
- Use null for fields not found in the document
- key_fields should be an object of relevant extracted name-value pairs
- parties and amounts should be arrays when multiple values exist
- Be accurate; do not invent information not present in the text`,
      },
      {
        role: "user",
        content: `Extract structured data from this document text:\n\n${text.slice(0, 12000)}`,
      },
    ],
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return JSON.parse(content) as Record<string, unknown>;
}
