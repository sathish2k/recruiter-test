import { extractDocumentText } from "../lib/document-text";
import { type ExtractField, extractStructured } from "../lib/gemini";

/**
 * Generic document → form-values extraction. The caller (a config-driven form)
 * sends the fields it wants; nothing about candidates or resumes is hardcoded
 * here, so adding a field to a form's configuration is the only change needed
 * for it to be extracted.
 */

/** Caps on the caller-supplied contract — it drives a paid model call, so it
 * is treated as untrusted input and bounded on every axis. */
const LIMITS = {
  fields: 60,
  itemFields: 20,
  enumValues: 60,
  totalEnumValues: 200,
  hintChars: 160,
  nameChars: 64,
  arrayItems: 25,
  stringChars: 2000,
} as const;

const NAME = /^[A-Za-z][A-Za-z0-9_]*$/;
const TYPES = new Set(["string", "number", "integer", "boolean", "array"]);
/** A hint is a `description` on a schema property, never concatenated into the
 * instruction — this charset keeps it from carrying one anyway. */
const HINT = /^[\p{L}\p{N} .,'"()/+@:_-]+$/u;

/**
 * Fields that must never be model-populated whatever a form's configuration
 * says: pipeline state, ownership, identifiers, credentials and file slots.
 * A denylist here outlives any single config, so a stray `extract: true` in a
 * future change cannot reassign a record or corrupt its state.
 */
const NEVER_EXTRACT = new Set([
  "id",
  "agencyId",
  "organizationId",
  "createdAt",
  "updatedAt",
  "password",
  "status",
  "ownerId",
  "jobId",
  "startingStage",
  "source",
  "emailOptOut",
  "resume",
  "formattedResume",
  "coverLetter",
  "offer",
  "contracts",
  "others",
  "attachments",
  "autofillCv",
  "associateInfo",
]);

export class InvalidContractError extends Error {}

type RawField = Record<string, unknown>;

function sanitizeField(raw: RawField, depth: number): ExtractField | null {
  const name = typeof raw.name === "string" ? raw.name : "";
  const type = typeof raw.type === "string" ? raw.type : "";
  if (!NAME.test(name) || name.length > LIMITS.nameChars) return null;
  if (!TYPES.has(type)) return null;
  // Top-level names only: `summary` inside an experience row is fine, a
  // top-level `status` is not.
  if (depth === 0 && NEVER_EXTRACT.has(name)) return null;

  const field: ExtractField = { name, type: type as ExtractField["type"] };

  if (typeof raw.hint === "string") {
    const hint = raw.hint.replace(/\s+/g, " ").trim().slice(0, LIMITS.hintChars);
    if (hint && HINT.test(hint)) field.hint = hint;
  }
  if (Array.isArray(raw.enum)) {
    const values = raw.enum
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .slice(0, LIMITS.enumValues);
    if (values.length) field.enum = values;
  }
  if (type === "array") {
    field.itemType = raw.itemType === "object" ? "object" : "string";
    // One level of nesting only: repeater rows are flat records.
    if (field.itemType === "object") {
      if (depth > 0) return null;
      const rows = Array.isArray(raw.itemFields) ? raw.itemFields : [];
      const itemFields = rows
        .slice(0, LIMITS.itemFields)
        .map((row) => sanitizeField(row as RawField, depth + 1))
        .filter((row): row is ExtractField => row !== null);
      if (!itemFields.length) return null;
      field.itemFields = itemFields;
    }
  }
  return field;
}

/** Validates the caller's contract, dropping anything malformed. */
export function sanitizeContract(raw: unknown): ExtractField[] {
  if (!Array.isArray(raw)) throw new InvalidContractError("Expected an array of fields");
  const seen = new Set<string>();
  const fields: ExtractField[] = [];
  // Enum members are the one part of a contract that scales the prompt without
  // bound (a repeated year list dwarfs the rest), so they get a shared budget.
  let enumBudget: number = LIMITS.totalEnumValues;

  const spend = (field: ExtractField) => {
    for (const child of field.itemFields ?? []) spend(child);
    if (!field.enum) return;
    if (enumBudget < field.enum.length) {
      // Over budget: ask for a plain string and let coercion enforce
      // membership instead of paying for the option list.
      field.enum = undefined;
      return;
    }
    enumBudget -= field.enum.length;
  };

  for (const entry of raw.slice(0, LIMITS.fields)) {
    const field = sanitizeField(entry as RawField, 0);
    if (!field || seen.has(field.name)) continue;
    seen.add(field.name);
    spend(field);
    fields.push(field);
  }
  if (!fields.length) throw new InvalidContractError("No valid fields requested");
  return fields;
}

function coerceScalar(field: ExtractField, value: unknown): unknown {
  if (value === null || value === undefined) return undefined;

  if (field.enum?.length) {
    const text = String(value).trim();
    // Match case-insensitively but store the configured value, so a model that
    // answers "Bachelors" still maps onto the option id "bachelors".
    return field.enum.find((option) => option.toLowerCase() === text.toLowerCase());
  }
  switch (field.type) {
    case "string": {
      const text = String(value).trim().slice(0, LIMITS.stringChars);
      return text || undefined;
    }
    case "number":
    case "integer": {
      const parsed =
        typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
      if (!Number.isFinite(parsed)) return undefined;
      return field.type === "integer" ? Math.round(parsed) : parsed;
    }
    case "boolean":
      return typeof value === "boolean" ? value : String(value).toLowerCase() === "true";
    default:
      return undefined;
  }
}

function coerceField(field: ExtractField, value: unknown): unknown {
  if (field.type !== "array") return coerceScalar(field, value);
  if (!Array.isArray(value)) return undefined;
  const items = value.slice(0, LIMITS.arrayItems);

  if (field.itemType === "object") {
    const rows = items
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row: Record<string, unknown> = {};
        for (const child of field.itemFields ?? []) {
          const coerced = coerceField(child, (item as Record<string, unknown>)[child.name]);
          if (coerced !== undefined) row[child.name] = coerced;
        }
        return Object.keys(row).length ? row : null;
      })
      .filter((row): row is Record<string, unknown> => row !== null);
    return rows.length ? rows : undefined;
  }

  // Only primitives: `String({name:"React"})` would otherwise store the string
  // "[object Object]" and break the chips widget.
  const values = items
    .filter((item) => typeof item === "string" || typeof item === "number")
    .map((item) => String(item).trim().slice(0, LIMITS.stringChars))
    .filter(Boolean);
  return values.length ? [...new Set(values)] : undefined;
}

/**
 * Keeps only requested fields, coerced to the requested type. The model is
 * asked for a schema but never trusted to have honoured it.
 */
export function coerceToContract(
  fields: ExtractField[],
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    const coerced = coerceField(field, raw[field.name]);
    if (coerced !== undefined) values[field.name] = coerced;
  }
  return values;
}

export interface ExtractDocumentInput {
  file: { name: string; type: string; bytes: Uint8Array };
  contract: unknown;
}

export async function extractFromDocument({ file, contract }: ExtractDocumentInput) {
  const fields = sanitizeContract(contract);
  const text = await extractDocumentText(file);
  const raw = await extractStructured(text, fields);
  return { values: coerceToContract(fields, raw), characters: text.length };
}
