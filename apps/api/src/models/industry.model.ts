import { integer, pgTable, text } from "drizzle-orm/pg-core";

/** Global industry reference list served to the client pickers. Not org-scoped —
 * the same catalogue for everyone (seeded in the table's migration). */
export const industry = pgTable("industry", {
  name: text("name").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
});
