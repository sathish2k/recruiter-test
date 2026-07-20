import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";

/** An outstanding invite to join an organization. Becomes a User + Contact when
 * accepted; until then it only exists here. */
export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("employee"),
  /** Client-access scope for client-role invites (comma-joined names). */
  clientAccess: text("client_access"),
  status: text("status").$type<InvitationStatus>().notNull().default("pending"),
  invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
