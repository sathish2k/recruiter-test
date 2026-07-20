import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type ContactType = "teammate" | "client" | "hiring_manager" | "candidate";

/** A person in the CRM/ATS. `userId` is set only when that person can also log
 * in (recruiters/admins); clients, hiring managers and candidates are contacts
 * with no User until they're invited. */
export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  type: text("type").$type<ContactType>().notNull().default("teammate"),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
