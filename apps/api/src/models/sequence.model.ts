import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { organization } from "./organization.model";

/**
 * Per-workspace counters behind the human-facing references (REQ-0001). One row
 * per organization × kind, incremented in a single statement so two creates
 * arriving together can never be handed the same number.
 */
export const sequence = pgTable("sequence", {
  /** `<organizationId>:<kind>`. */
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  value: integer("value").notNull().default(0),
});
