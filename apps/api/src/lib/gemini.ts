import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export const DEFAULT_MODEL = "gemini-2.5-flash";

export async function generateText(
  prompt: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  const res = await getClient().models.generateContent({
    model,
    contents: prompt,
  });
  return res.text ?? "";
}
