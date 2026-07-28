import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { client } from "./client.model";
import { organization } from "./organization.model";

export type ClientInvoiceStatus = "paid" | "due" | "overdue";

/**
 * A fee invoice raised against a client for a placement. Distinct from
 * `invoice`, which bills the agency for its own subscription.
 */
export const clientInvoice = pgTable("client_invoice", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => client.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  /** What the fee was raised for — candidate and role, as the design lists it. */
  description: text("description"),
  amount: integer("amount").notNull().default(0),
  status: text("status").$type<ClientInvoiceStatus>().notNull().default("due"),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  dueAt: timestamp("due_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
