import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export type TemplateStatus = "enabled" | "draft" | "disabled";
/** Filing category in the Settings list; `custom` covers agency-authored ones. */
export type TemplateCategory = "auth" | "biz" | "custom";

// One row per agency template. `variables` and `body` are string arrays
// (body = paragraphs). Seeded per agency from DEFAULT_TEMPLATES at signup, and
// lazily on first read for agencies that predate the seed.
export const emailTemplate = pgTable(
  "email_template",
  {
    id: text("id").primaryKey(),
    agencyId: text("agency_id").notNull(),
    key: text("key").notNull(),
    icon: text("icon").notNull().default("mail"),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    category: text("category").$type<TemplateCategory>().notNull().default("custom"),
    subject: text("subject").notNull().default(""),
    // Inbox preview line — rendered by the mail client, never inside the email.
    preheader: text("preheader").notNull().default(""),
    // Big headline at the top of the email body.
    heading: text("heading").notNull().default(""),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    body: jsonb("body").$type<string[]>().notNull().default([]),
    cta: text("cta").notNull().default(""),
    // Token-bearing link the CTA button points at; the sender supplies the value.
    ctaUrl: text("cta_url").notNull().default("{action_url}"),
    footer: text("footer").notNull().default(""),
    // Sample recipient shown in the preview's inbox header.
    sampleTo: text("sample_to").notNull().default(""),
    status: text("status").$type<TemplateStatus>().notNull().default("enabled"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  // Makes the seed's onConflictDoNothing a real no-op instead of a second copy
  // when two requests race to seed the same agency.
  (table) => [uniqueIndex("email_template_agency_key_idx").on(table.agencyId, table.key)],
);
