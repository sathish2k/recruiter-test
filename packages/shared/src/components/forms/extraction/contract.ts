import type { JsonSchema, JsonSchemaProperty } from "../types";

/**
 * How a value must be shaped before it can be written into a widget. Derived
 * from the field's own configuration, so the apply step never has to guess.
 */
export type ExtractKind =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "boolean"
  | "enum"
  | "stringList"
  | "rows";

/** A field the form wants filled, plus everything the apply step needs. */
export interface ExtractPlanField {
  name: string;
  kind: ExtractKind;
  prop: JsonSchemaProperty;
  options?: string[];
  itemFields?: ExtractPlanField[];
}

/** One field as sent to the API — the wire projection of a plan field. */
export interface ExtractFieldSpec {
  name: string;
  type: "string" | "number" | "integer" | "boolean" | "array";
  enum?: string[];
  hint?: string;
  itemType?: "string" | "object";
  itemFields?: ExtractFieldSpec[];
}

/** Extracts values for a document, keyed by form field name. */
export type DocumentExtractor = (
  file: File,
  fields: ExtractFieldSpec[],
) => Promise<Record<string, unknown>>;

/** Widgets whose value is a file, a remote id or pure decoration — never
 * something a document can supply. */
const NEVER = new Set([
  "attachments",
  "upload",
  "callout",
  "resumeAutofill",
  "days",
  "color",
  "checkbox-group",
  "multiselect",
  "slider",
]);

/** "currentJobTitle" → "current job title". Field names are already
 * descriptive, so this default keeps most configs at `extract: true`. */
function humanize(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase();
}

function kindOf(prop: JsonSchemaProperty): ExtractKind | null {
  if (prop.widget && NEVER.has(prop.widget)) return null;
  // Checked before `optionSource`: a phone's option list is the dial codes, not
  // its own value, so it stays extractable.
  if (prop.widget === "phone") return "phone";
  // Elsewhere, options come from the API, so the value is an id this document
  // cannot contain — extracting it would write a plausible-looking wrong key.
  if (prop.optionSource) return null;

  if (prop.widget === "repeater") return prop.itemSchema ? "rows" : null;
  if (prop.widget === "chips") return "stringList";
  if (prop.enum?.length) return "enum";
  if (prop.widget === "number" || prop.type === "number" || prop.type === "integer")
    return "number";
  if (prop.type === "boolean") return "boolean";
  if (prop.type === "array") return "stringList";
  if (prop.type === "string") return prop.format === "email" ? "email" : "text";
  return null;
}

function planField(name: string, prop: JsonSchemaProperty): ExtractPlanField | null {
  const kind = kindOf(prop);
  if (!kind) return null;
  const field: ExtractPlanField = { name, kind, prop };

  if (prop.enum?.length) field.options = prop.enum.map(String).filter(Boolean);

  if (kind === "rows") {
    const itemFields = Object.entries(prop.itemSchema ?? {})
      .map(([key, child]) => planField(key, child))
      .filter((child): child is ExtractPlanField => child !== null);
    if (!itemFields.length) return null;
    field.itemFields = itemFields;
  }
  return field;
}

/**
 * Builds the extraction plan from a form's schema: every property marked
 * `extract`. Add or remove a field in the configuration and the request — and
 * therefore the prefill — follows automatically.
 */
export function extractionPlan(schema?: JsonSchema): ExtractPlanField[] {
  if (!schema?.properties) return [];
  const plan: ExtractPlanField[] = [];
  for (const [name, prop] of Object.entries(schema.properties)) {
    if (!prop.extract) continue;
    const field = planField(name, prop);
    if (field) plan.push(field);
  }
  return plan;
}

const WIRE_TYPE: Record<ExtractKind, ExtractFieldSpec["type"]> = {
  text: "string",
  email: "string",
  phone: "string",
  number: "number",
  boolean: "boolean",
  enum: "string",
  stringList: "array",
  rows: "array",
};

function specOf(field: ExtractPlanField): ExtractFieldSpec {
  const { prop } = field;
  const configured = typeof prop.extract === "object" ? prop.extract.hint : undefined;
  const spec: ExtractFieldSpec = {
    name: field.name,
    type: prop.type === "integer" && field.kind === "number" ? "integer" : WIRE_TYPE[field.kind],
    // A literal English hint, never a translation key — what gets extracted
    // must not change with the UI language.
    hint: configured ?? humanize(field.name),
  };
  // The storable option ids, never the localised labels.
  if (field.options?.length) spec.enum = field.options;
  if (field.kind === "rows") {
    spec.itemType = "object";
    spec.itemFields = (field.itemFields ?? []).map(specOf);
  } else if (field.kind === "stringList") {
    spec.itemType = "string";
  }
  return spec;
}

/** The wire contract for a plan. */
export function planToContract(plan: ExtractPlanField[]): ExtractFieldSpec[] {
  return plan.map(specOf);
}
