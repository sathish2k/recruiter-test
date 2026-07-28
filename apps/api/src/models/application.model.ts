import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { candidate } from "./candidate.model";
import { job } from "./job.model";
import { organization } from "./organization.model";
import { pipelineStage, rejectionReason } from "./pipeline.model";

/** Where an application has got to overall, independent of which stage it sits
 * in: `active` is on the board, the other three are closed out. */
export type ApplicationStatus = "active" | "rejected" | "withdrawn" | "hired";

/**
 * A candidate on a requirement — the record the whole cycle hangs off. One per
 * (candidate, requirement) pair, so the same person can be on several roles at
 * once and each carries its own stage, owner and consent.
 */
export const application = pgTable(
  "application",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    candidateId: text("candidate_id")
      .notNull()
      .references(() => candidate.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => job.id, { onDelete: "cascade" }),
    /** By id, never by name — a stage rename must not orphan the board. */
    stageId: text("stage_id").references(() => pipelineStage.id, { onDelete: "set null" }),
    status: text("status").$type<ApplicationStatus>().notNull().default("active"),
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    /** Consent is per client (TC-SUB-002), so it lives here rather than on the
     * candidate: agreeing to one submission is not agreeing to all of them. */
    consentAt: timestamp("consent_at"),
    consentSource: text("consent_source"),
    /** Set together with `status = "rejected"`; the catalogue is the
     * workspace's own `rejection_reason` rows. */
    rejectionReasonId: text("rejection_reason_id").references(() => rejectionReason.id, {
      onDelete: "set null",
    }),
    rejectionNote: text("rejection_note"),
    closedAt: timestamp("closed_at"),
    /** When the current stage was entered — the clock every SLA reads. Kept
     * denormalised so the board does not have to walk history per card. */
    stageEnteredAt: timestamp("stage_entered_at").notNull().defaultNow(),
    /** How the application came to exist: manual, board, import, apply. */
    source: text("source"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // One application per person per requirement — the re-apply case reopens
    // the existing row rather than making a second one.
    uniqueIndex("application_candidate_job_unique").on(table.candidateId, table.jobId),
    index("application_job_stage_idx").on(table.jobId, table.stageId),
    index("application_org_status_idx").on(table.organizationId, table.status),
  ],
);

/**
 * Every stage move, in order. This is the one table that cannot be
 * reconstructed later — time-in-stage, conversion and every funnel the product
 * sells are read from it — so it is written by the same function that moves an
 * application, never by a screen.
 */
export const applicationStageHistory = pgTable(
  "application_stage_history",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    fromStageId: text("from_stage_id"),
    toStageId: text("to_stage_id"),
    /** Stage names as they read at the time, so history survives a rename. */
    fromStageName: text("from_stage_name"),
    toStageName: text("to_stage_name"),
    /** The lifecycle status after this move. */
    status: text("status").$type<ApplicationStatus>().notNull().default("active"),
    reasonId: text("reason_id"),
    reasonLabel: text("reason_label"),
    note: text("note"),
    /** Days the application spent in `fromStage` — computed on the move, when
     * the entry timestamp is still to hand. */
    daysInPreviousStage: integer("days_in_previous_stage"),
    actorId: text("actor_id"),
    actorName: text("actor_name"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("application_history_application_idx").on(table.applicationId)],
);
