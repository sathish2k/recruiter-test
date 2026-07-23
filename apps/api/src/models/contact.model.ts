import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { client } from "./client.model";
import { organization } from "./organization.model";

export type ContactType = "teammate" | "client" | "hiring_manager" | "candidate";
export type ContactStatus = "active" | "inactive" | "left";

/** A stored file tied to a contact — NDAs, org charts, etc. `url` is the R2
 * public URL minted at upload time. */
export interface ContactAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/** A person in the CRM/ATS. `userId` is set only when that person can also log
 * in (recruiters/admins); clients, hiring managers and candidates are contacts
 * with no User until they're invited. */
export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  /** The client this person works at (hiring managers / HR / finance). */
  clientId: text("client_id").references(() => client.id, { onDelete: "set null" }),
  /** The recruiter who owns this relationship. */
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  type: text("type").$type<ContactType>().notNull().default("teammate"),
  salutation: text("salutation"),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  email: text("email"),
  secondaryEmail: text("secondary_email"),
  /** The design's "Work phone"; `mobile` is the second number. */
  phone: text("phone"),
  mobile: text("mobile"),
  title: text("title"),
  department: text("department"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  source: text("source"),
  /** Free-form "Description" — context for the team. */
  notes: text("notes"),
  /** NDAs, org charts and anything tied to this person. */
  attachments: jsonb("attachments").$type<ContactAttachment[]>(),
  status: text("status").$type<ContactStatus>().notNull().default("active"),
  /** Primary contact for its client — at most one, cleared on the others. */
  isPrimary: boolean("is_primary").notNull().default(false),
  /** Excluded from weekly client reports and bulk emails. */
  emailOptOut: boolean("email_opt_out").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
