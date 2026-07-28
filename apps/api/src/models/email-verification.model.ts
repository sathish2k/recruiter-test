import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";

/**
 * Email verification, per requirements §5.1.2. Kept separate from Better Auth's
 * generic `verification` table because this flow owns two credentials at once —
 * a 6-digit code the user types and a token behind the magic link — plus the
 * resend counters the rate limit needs.
 *
 * One live row per user: sending again replaces the previous row, so an old
 * code stops working the moment a new one is issued.
 */
export const emailVerification = pgTable("email_verification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  /** What the user types. */
  code: text("code").notNull(),
  /** What the magic link carries. Single-use, like the code. */
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  /** Wrong-code attempts against this row; too many forces a resend. */
  attempts: integer("attempts").notNull().default(0),
  /** Sends in the current hour, for the 5/hour cap. */
  sendsThisHour: integer("sends_this_hour").notNull().default(1),
  hourStartedAt: timestamp("hour_started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
