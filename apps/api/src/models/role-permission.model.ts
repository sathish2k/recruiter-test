import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

// One row per (agency, role). `permissions` is a resource → actions map
// (e.g. { candidates: ["read","create"], "*": [...] }). Id is `${agencyId}:${role}`.
export const rolePermission = pgTable("role_permission", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id").notNull(),
  role: text("role").notNull(),
  permissions: jsonb("permissions").$type<Record<string, string[]>>().notNull(),
});
