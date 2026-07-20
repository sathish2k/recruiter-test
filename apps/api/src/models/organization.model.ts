import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";

/** A company/agency workspace. Everything in the ATS is scoped to one. */
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type OrganizationRole = "owner" | "admin" | "recruiter";

/** Join of User ↔ Organization carrying the org-level role. Id is
 * `${organizationId}:${userId}` so a user joins an org at most once. */
export const organizationMember = pgTable("organization_member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").$type<OrganizationRole>().notNull().default("recruiter"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
