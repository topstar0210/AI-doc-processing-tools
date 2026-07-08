import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 96;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    vectors.push(...response.data.sort((a, b) => a.index - b.index).map((item) => item.embedding));
  }

  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}

export const EMBEDDING_DIMENSIONS = 1536;
