import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type AuditCategory =
  | "permissions"
  | "candidates"
  | "clientActions"
  | "requirements"
  | "billing"
  | "system"
  | "security"
  | "integrations"
  | "email";

export type AuditSeverity = "success" | "warning" | "failure";

/** Append-only activity feed. `objects` holds the clickable subject chips
 * (`{ Member: "Dev Shah" }`); `details` the label/value rows in the drawer. */
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  /** Denormalised so the feed survives the actor being deleted. */
  actorName: text("actor_name").notNull().default("System"),
  event: text("event").notNull(),
  category: text("category").$type<AuditCategory>().notNull().default("system"),
  severity: text("severity").$type<AuditSeverity>().notNull().default("success"),
  ip: text("ip"),
  objects: jsonb("objects").$type<Record<string, string>>(),
  details: jsonb("details").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
