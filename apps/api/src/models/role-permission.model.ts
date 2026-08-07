import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per (agency, role). `permissions` is a resource → actions map
// (e.g. { candidates: ["read","create"], "*": [...] }). Id is `${agencyId}:${role}`.
// The row also carries the role itself: built-in roles seed from
// DEFAULT_ROLE_PERMISSIONS with `system` true; a custom role an agency invents
// is a row like any other, with its own label and description.
export const rolePermission = pgTable("role_permission", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id").notNull(),
  role: text("role").notNull(),
  permissions: jsonb("permissions").$type<Record<string, string[]>>().notNull(),
  /** resource → "own" | "team" | "all". A missing key reads as "all". */
  scope: jsonb("scope").$type<Record<string, string>>(),
  /** Custom roles only — built-in labels and copy come from translations. */
  label: text("label"),
  description: text("description"),
  /** IconRenderer registry key shown on the role card. */
  icon: text("icon"),
  /** Ships with HirePilotX: editable, never deletable. */
  system: boolean("system").notNull().default(true),
  updatedAt: timestamp("updated_at"),
  updatedBy: text("updated_by"),
});
