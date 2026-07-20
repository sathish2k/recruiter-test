import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per agency template. `variables` and `body` are string arrays
// (body = paragraphs). Seeded per agency from DEFAULT_TEMPLATES on first read.
export const emailTemplate = pgTable("email_template", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id").notNull(),
  key: text("key").notNull(),
  icon: text("icon").notNull().default("mail"),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  subject: text("subject").notNull().default(""),
  variables: jsonb("variables").$type<string[]>().notNull().default([]),
  body: jsonb("body").$type<string[]>().notNull().default([]),
  cta: text("cta").notNull().default(""),
  footer: text("footer").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
