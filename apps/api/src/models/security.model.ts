import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type LoginResult = "success" | "failed" | "blocked";

/** Sign-in attempts. Separate from `session` — a row here survives sign-out and
 * records failures, which never produce a session. */
export const loginHistory = pgTable("login_history", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  browser: text("browser"),
  os: text("os"),
  location: text("location"),
  ip: text("ip"),
  result: text("result").$type<LoginResult>().notNull().default("success"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Personal access tokens. Only the hash is stored — the plaintext is shown
 * once, at creation. */
export const apiToken = pgTable("api_token", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull(),
  /** Leading chars kept for display (`hpx_pat_9f2K…`). */
  prefix: text("prefix").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Per-user security state that doesn't belong on Better Auth's `user` table. */
export const userSecurity = pgTable("user_security", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorEnabledAt: timestamp("two_factor_enabled_at"),
  recoveryCodes: jsonb("recovery_codes").$type<string[]>(),
  recoveryCodesGeneratedAt: timestamp("recovery_codes_generated_at"),
  passwordChangedAt: timestamp("password_changed_at"),
  notifyNewDevice: boolean("notify_new_device").notNull().default(true),
  notifyPasswordChange: boolean("notify_password_change").notNull().default(true),
  notifyTwoFactorDisabled: boolean("notify_two_factor_disabled").notNull().default(true),
  notifySsoChange: boolean("notify_sso_change").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Extra addresses that receive security alerts alongside the account owner. */
export const securityRecipient = pgTable("security_recipient", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
