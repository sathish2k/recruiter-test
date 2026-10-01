import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.model";

export const emailVerification = pgTable("email_verification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  sendsThisHour: integer("sends_this_hour").notNull().default(1),
  hourStartedAt: timestamp("hour_started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
