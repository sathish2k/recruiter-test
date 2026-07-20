import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./organization.model";

export type InvoiceStatus = "paid" | "pending" | "refunded";

/** One row per organization — the plan it sits on and the payment details we
 * display. Amounts are minor units (paise) so no float rounding creeps in. */
export const subscription = pgTable("subscription", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  plan: text("plan").notNull().default("growth"),
  status: text("status").notNull().default("active"),
  seatTotal: integer("seat_total").notNull().default(5),
  /** Annual price in paise. */
  priceAnnual: integer("price_annual").notNull().default(28_800_000),
  /** Per extra seat, per month, in paise. */
  seatPriceMonthly: integer("seat_price_monthly").notNull().default(300_000),
  currency: text("currency").notNull().default("INR"),
  renewsAt: timestamp("renews_at"),
  paymentBrand: text("payment_brand"),
  paymentLast4: text("payment_last4"),
  paymentExpiry: text("payment_expiry"),
  billingEmail: text("billing_email"),
  billingName: text("billing_name"),
  gstin: text("gstin"),
  billingAddress: text("billing_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  plan: text("plan").notNull(),
  /** Minor units (paise). */
  amount: integer("amount").notNull(),
  status: text("status").$type<InvoiceStatus>().notNull().default("paid"),
});

/** Usage counters, one row per organization per billing period (`YYYY-MM`). */
export const usageMetric = pgTable("usage_metric", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
  aiCreditsTotal: integer("ai_credits_total").notNull().default(5000),
  resumeParsing: integer("resume_parsing").notNull().default(0),
  candidateMatches: integer("candidate_matches").notNull().default(0),
  emailsSent: integer("emails_sent").notNull().default(0),
  /** Bytes. */
  storageUsed: integer("storage_used").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
