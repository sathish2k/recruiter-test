import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("admin"),
  agencyId: text("agency_id"),
  team: text("team"),
  status: text("status").notNull().default("active"),
  phone: text("phone"),
  timezone: text("timezone"),
  signature: text("signature"),
  notificationPrefs: jsonb("notification_prefs").$type<Record<string, boolean>>(),
  preferences: jsonb("preferences").$type<Record<string, string>>(),
  clientAccess: jsonb("client_access").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
