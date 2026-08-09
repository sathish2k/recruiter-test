import type { FieldValues } from "react-hook-form";
import type { FieldCondition, JsonSchema } from "./types";

/** Whether a `condition`/`disabledWhen` predicate holds against current values.
 * No predicate → always true. Evaluated against RAW values so an empty-string
 * sentinel (e.g. `notEquals: ""`) is preserved. */
export function evalCondition(cond: FieldCondition | undefined, values: FieldValues): boolean {
  if (!cond) return true;
  const actual = values[cond.field];
  if (cond.digitsMin !== undefined) return digitsOf(actual) >= cond.digitsMin;
  if (cond.filled !== undefined)
    return (typeof actual === "string" ? actual.trim() : actual) ? cond.filled : !cond.filled;
  if (cond.in) return cond.in.includes(actual as never);
  if (cond.notEquals !== undefined) return actual !== cond.notEquals;
  if (cond.equals !== undefined) return actual === cond.equals;
  return true;
}

/** Digits in a phone value, minus its dial code — `+91 81234 56789` → 10. */
function digitsOf(value: unknown): number {
  if (typeof value !== "string") return 0;
  return value.replace(/^\+\d+/, "").replace(/\D/g, "").length;
}

/** Field names whose `condition` is currently false — hidden, so excluded from
 * both the payload and validation. */
export function hiddenFields(schema: JsonSchema, values: FieldValues): Set<string> {
  const hidden = new Set<string>();
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.condition && !evalCondition(prop.condition, values)) hidden.add(key);
  }
  return hidden;
}
