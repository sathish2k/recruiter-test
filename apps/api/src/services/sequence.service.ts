import { sql } from "drizzle-orm";
import { db } from "../db";
import { sequence } from "../models/sequence.model";

/**
 * The next number for a workspace counter. Insert-or-increment in one
 * statement — the returned value is reserved for this caller alone.
 */
export async function nextSequence(organizationId: string, kind: string): Promise<number> {
  const [row] = await db
    .insert(sequence)
    .values({ id: `${organizationId}:${kind}`, organizationId, kind, value: 1 })
    .onConflictDoUpdate({
      target: sequence.id,
      set: { value: sql`${sequence.value} + 1` },
    })
    .returning();
  return row?.value ?? 1;
}

/** `REQ-` + 4-digit number, widening past 9999 rather than wrapping. */
export function formatReference(prefix: string, value: number): string {
  return `${prefix}${String(value).padStart(4, "0")}`;
}
