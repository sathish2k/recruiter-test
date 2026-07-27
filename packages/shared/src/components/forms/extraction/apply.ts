import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { JsonSchemaProperty } from "../types";
import type { ExtractPlanField } from "./contract";

/**
 * Turns extracted values into values a widget can actually render. The API
 * already coerced to the requested JSON types; this pass enforces the *widget's*
 * contract (a phone's stored format, an enum's membership, a repeater row's key
 * set) and drops anything that would render blank or block validation.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LIST_ITEMS = 40;

function blankFor(prop: JsonSchemaProperty): unknown {
  if (prop.type === "array") return [];
  if (prop.type === "boolean") return false;
  return "";
}

export function isBlank(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function matchOption(options: string[] | undefined, value: unknown): string | undefined {
  const text = String(value).trim();
  if (!text) return undefined;
  // Store the configured id even when the model answers with different casing.
  return options?.find((option) => option.toLowerCase() === text.toLowerCase());
}

function coerce(field: ExtractPlanField, value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  const { prop } = field;

  switch (field.kind) {
    case "enum":
      return matchOption(field.options, value);

    case "email": {
      const text = String(value).trim();
      // ajv validates this field on submit; a malformed address would block a
      // save the user never caused.
      return EMAIL.test(text) ? text : undefined;
    }

    case "phone": {
      // The widget stores "+91 98450 12340" and splits on the dial code, so a
      // number without a country code cannot be stored correctly at all.
      const parsed = parsePhoneNumberFromString(String(value).trim());
      if (!parsed?.countryCallingCode || !parsed.isPossible()) return undefined;
      return `+${parsed.countryCallingCode} ${parsed.nationalNumber}`;
    }

    case "number": {
      const parsed =
        typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
      if (!Number.isFinite(parsed)) return undefined;
      // Out of range is a misread, not something to silently clamp.
      if (prop.minimum !== undefined && parsed < prop.minimum) return undefined;
      if (prop.maximum !== undefined && parsed > prop.maximum) return undefined;
      return prop.type === "integer" ? Math.round(parsed) : parsed;
    }

    case "boolean":
      return typeof value === "boolean" ? value : undefined;

    case "stringList": {
      if (!Array.isArray(value)) return undefined;
      const items = [
        ...new Set(
          value
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ].slice(0, MAX_LIST_ITEMS);
      return items.length ? items : undefined;
    }

    case "rows": {
      if (!Array.isArray(value)) return undefined;
      const rows = value
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          // Seed the full key set first: a row missing a key would flip that
          // control from controlled to uncontrolled when it renders.
          const row: Record<string, unknown> = {};
          let filled = false;
          for (const child of field.itemFields ?? []) {
            const coerced = coerce(child, (item as Record<string, unknown>)[child.name]);
            row[child.name] = coerced ?? blankFor(child.prop);
            if (coerced !== undefined) filled = true;
          }
          return filled ? row : null;
        })
        .filter((row): row is Record<string, unknown> => row !== null);
      return rows.length ? rows : undefined;
    }

    default: {
      const text = String(value).trim();
      if (!text) return undefined;
      // Over-length text blocks the save; truncate a textarea, drop an input.
      if (prop.maxLength !== undefined && text.length > prop.maxLength) {
        return prop.widget === "textarea" ? text.slice(0, prop.maxLength) : undefined;
      }
      return text;
    }
  }
}

export interface AppliedExtraction {
  /** Field name → value to write. */
  values: Record<string, unknown>;
  /** Names written — these are the array fields that need a form-level reset. */
  filled: string[];
}

/**
 * Coerces extracted values per field, keeping only those that are safe to
 * write: a field is filled only when it is still blank, so a slow parse can
 * never overwrite what the user typed while waiting.
 */
export function applyExtraction(
  plan: ExtractPlanField[],
  extracted: Record<string, unknown>,
  current: Record<string, unknown>,
): AppliedExtraction {
  const values: Record<string, unknown> = {};
  const filled: string[] = [];

  for (const field of plan) {
    const overwrite = typeof field.prop.extract === "object" && field.prop.extract.overwrite;
    if (!overwrite && !isBlank(current[field.name])) continue;
    const value = coerce(field, extracted[field.name]);
    if (value === undefined || isBlank(value)) continue;
    values[field.name] = value;
    filled.push(field.name);
  }
  return { values, filled };
}
