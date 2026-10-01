import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/user.model";
import { organization } from "./organization.model";

export type OrganizationRole = "owner" | "admin" | "recruiter";

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
