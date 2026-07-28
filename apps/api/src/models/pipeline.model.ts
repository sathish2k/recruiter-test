import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./organization.model";

/**
 * The board's columns, per organization. A table rather than a settings blob
 * because applications will reference a stage by id and stage history has to
 * survive a rename — flow §5.
 *
 * `kind` marks the two fixed ends: every candidate enters at the `entry` stage
 * and a hire finishes at the `hire` stage. Neither can be removed.
 */
export const pipelineStage = pgTable("pipeline_stage", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  /** Whether clients see this stage in their portal. */
  clientVisible: boolean("client_visible").notNull().default(false),
  /** Days a candidate may sit here before the stage is breached. 0 is "no
   * limit". A requirement can override it per stage (`job.stage_slas`). */
  slaDays: integer("sla_days").notNull().default(0),
  kind: text("kind").$type<"entry" | "middle" | "hire">().notNull().default("middle"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type RejectionCategory = "client" | "candidate" | "internal";

/**
 * The reasons a recruiter picks when closing a candidate out. Deactivated
 * rather than deleted, so historical rejections keep their label.
 */
export const rejectionReason = pgTable("rejection_reason", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  category: text("category").$type<RejectionCategory>().notNull(),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
