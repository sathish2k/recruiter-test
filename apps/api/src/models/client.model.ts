import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type ClientStatus = "hiring" | "paused";
export type ClientHealth = "healthy" | "attention" | "at_risk" | "dormant";
export type FeeBasis = "percent" | "flat";

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/** A stored file tied to a client — MSA/contract, org charts, etc. */
export interface ClientAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/** A company/account the agency recruits for. Everything (requirements,
 * contacts, placements) hangs off a client. */
export const client = pgTable("client", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  parentCompany: text("parent_company"),
  /** The main person to contact at this client (a `contact.id`). No FK — the
   * contact also points back at the client, and circular FKs are painful. */
  primaryContactId: text("primary_contact_id"),
  industry: text("industry"),
  website: text("website"),
  phone: text("phone"),
  billingEmail: text("billing_email"),
  /** Billing address. */
  address: jsonb("address").$type<ClientAddress>(),
  /** Shipping address — mirrors billing when `shippingSameAsBilling`. */
  shippingAddress: jsonb("shipping_address").$type<ClientAddress>(),
  shippingSameAsBilling: boolean("shipping_same_as_billing").notNull().default(true),
  /** The recruiter who owns the relationship. */
  accountLeadId: text("account_lead_id").references(() => user.id, { onDelete: "set null" }),
  source: text("source"),
  feeBasis: text("fee_basis").$type<FeeBasis>(),
  feeValue: text("fee_value"),
  paymentTerms: text("payment_terms"),
  taxId: text("tax_id"),
  notes: text("notes"),
  /** The signed MSA / master service agreement — its own labelled slot. */
  contract: jsonb("contract").$type<ClientAttachment[]>(),
  /** Everything else tied to this client (org charts, briefs, …). */
  attachments: jsonb("attachments").$type<ClientAttachment[]>(),
  status: text("status").$type<ClientStatus>().notNull().default("hiring"),
  health: text("health").$type<ClientHealth>().notNull().default("healthy"),
  logo: text("logo"),
  // Populated once jobs/candidates/placements exist; stored so the card renders.
  openRoles: integer("open_roles").notNull().default(0),
  candidates: integer("candidates").notNull().default(0),
  placements: integer("placements").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
