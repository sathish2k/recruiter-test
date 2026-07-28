import { status } from "elysia";
import {
  EmptyDocumentError,
  MAX_DOCUMENT_BYTES,
  UnsupportedDocumentError,
} from "../lib/document-text";
import { isGeminiConfigured, ModelError } from "../lib/gemini";
import {
  extractFromDocument,
  extractFromText,
  InvalidContractError,
} from "../services/document-extraction.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

const MAX_CONTRACT_CHARS = 16_384;

/** Maps a service/lib error onto the right HTTP status. */
function toStatus(error: unknown) {
  if (error instanceof InvalidContractError) return status(400, error.message);
  if (error instanceof UnsupportedDocumentError) return status(415, error.message);
  if (error instanceof EmptyDocumentError) return status(422, error.message);
  // Never surface the model's own message — it can echo document content.
  if (error instanceof ModelError) return status(502, "Extraction failed — please try again");
  throw error;
}

export async function postDocumentExtraction(ctx: {
  user: Auth;
  body: { file: File; fields: string };
}) {
  if (!isGeminiConfigured()) return status(503, "Document extraction is not configured");
  // Model spend is metered per agency; a user without one has no bucket.
  if (!ctx.user.agencyId) return status(403, "No agency for this user");

  const { file } = ctx.body;
  if (file.size > MAX_DOCUMENT_BYTES) {
    return status(413, `File is larger than ${Math.round(MAX_DOCUMENT_BYTES / 1024 / 1024)}MB`);
  }
  if (ctx.body.fields.length > MAX_CONTRACT_CHARS) {
    return status(400, "Requested field list is too large");
  }

  let contract: unknown;
  try {
    contract = JSON.parse(ctx.body.fields);
  } catch {
    return status(400, "`fields` must be a JSON array");
  }

  try {
    const { values, characters } = await extractFromDocument({
      file: {
        name: file.name,
        type: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
      },
      contract,
    });
    return { data: values, meta: { characters } };
  } catch (error) {
    return toStatus(error);
  }
}

const MAX_TEXT_CHARS = 24_000;

export async function postTextExtraction(ctx: {
  user: Auth;
  body: { text: string; fields: string };
}) {
  if (!isGeminiConfigured()) return status(503, "Extraction is not configured");
  if (!ctx.user.agencyId) return status(403, "No agency for this user");
  if (!ctx.body.text.trim()) return status(422, "Nothing to read yet");
  if (ctx.body.text.length > MAX_TEXT_CHARS) return status(413, "Too much text to read");
  if (ctx.body.fields.length > MAX_CONTRACT_CHARS) {
    return status(400, "Requested field list is too large");
  }

  let contract: unknown;
  try {
    contract = JSON.parse(ctx.body.fields);
  } catch {
    return status(400, "`fields` must be a JSON array");
  }

  try {
    const result = await extractFromText({ text: ctx.body.text, contract });
    return { data: result.values };
  } catch (error) {
    return toStatus(error);
  }
}
