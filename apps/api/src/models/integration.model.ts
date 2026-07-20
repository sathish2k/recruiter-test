import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type IntegrationStatus = "connected" | "warning" | "available";

/** Only *connected* providers get a row — the full catalogue (names, marks,
 * descriptions, grouping) lives in the tab's configuration, and the service
 * merges these rows onto it. */
export const integration = pgTable(
  "integration",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /** Catalogue key, e.g. `linkedin`, `gmail`. */
    provider: text("provider").notNull(),
    status: text("status").$type<IntegrationStatus>().notNull().default("connected"),
    account: text("account"),
    connectedBy: text("connected_by").references(() => user.id, { onDelete: "set null" }),
    connectedByName: text("connected_by_name"),
    lastSyncAt: timestamp("last_sync_at"),
    /** `two-way` | `pull` | `push`. */
    direction: text("direction"),
    /** Amber banner text when the connection needs attention. */
    warning: text("warning"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique("integration_org_provider").on(table.organizationId, table.provider)],
);
