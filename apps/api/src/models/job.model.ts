import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { client } from "./client.model";
import { contact } from "./contact.model";
import { organization } from "./organization.model";

export type JobStatus = "open" | "on_hold" | "filled" | "closed";

export interface JobAddress {
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/** A file tied to a job — the JD or supporting docs. */
export interface JobAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/**
 * A disqualifying question asked before a candidate reaches the pipeline.
 * `expected` is the answer that keeps them in it; anything else knocks out.
 */
export interface KnockoutQuestion {
  question: string;
  expected: "yes" | "no";
}

/** Stage id → the days this requirement allows in that stage, overriding the
 * workspace default on `pipeline_stage`. */
export type StageSlas = Record<string, number>;

/** An open requirement the agency is recruiting for, under a client. */
export const job = pgTable("job", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  clientId: text("client_id").references(() => client.id, { onDelete: "set null" }),
  clientContactId: text("client_contact_id").references(() => contact.id, { onDelete: "set null" }),
  dateOpened: text("date_opened"),
  targetDate: text("target_date"),
  employmentType: text("employment_type"),
  workExperience: text("work_experience"),
  industry: text("industry"),
  // Free-form long text (markdown) + must-have skills, per the design's
  // Description tabs and Must-have skills section.
  description: text("description"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  skills: jsonb("skills").$type<string[]>(),
  /** Weighted lower than `skills` by AI screening. */
  niceToHaveSkills: jsonb("nice_to_have_skills").$type<string[]>(),
  openings: integer("openings").notNull().default(1),
  salaryCurrency: text("salary_currency"),
  salaryMin: text("salary_min"),
  salaryMax: text("salary_max"),
  /** No office address — the design hides the address block. */
  remote: boolean("remote").notNull().default(false),
  status: text("status").$type<JobStatus>().notNull().default("open"),
  address: jsonb("address").$type<JobAddress>(),
  revenuePerPosition: text("revenue_per_position"),
  actualRevenue: text("actual_revenue"),
  missedRevenue: text("missed_revenue"),
  jobSummary: jsonb("job_summary").$type<JobAttachment[]>(),
  attachments: jsonb("attachments").$type<JobAttachment[]>(),
  aiScreening: boolean("ai_screening").notNull().default(false),
  screeningCriteria: text("screening_criteria"),
  matchThreshold: integer("match_threshold").notNull().default(80),
  autoAdvance: boolean("auto_advance").notNull().default(true),
  knockoutQuestions: jsonb("knockout_questions").$type<KnockoutQuestion[]>(),
  /** Per-stage day limits for this requirement only; unset stages fall back to
   * `pipeline_stage.sla_days`. */
  stageSlas: jsonb("stage_slas").$type<StageSlas>(),
  dailyDigest: boolean("daily_digest").notNull().default(true),
  /** System reference shown to the client, e.g. REQ-0041. Assigned on create
   * from the workspace's requirement prefix — never edited. */
  reference: text("reference"),
  roleCategory: text("role_category"),
  workModel: text("work_model"),
  priority: text("priority"),
  sourcerId: text("sourcer_id").references(() => user.id, { onDelete: "set null" }),
  profileLeadId: text("profile_lead_id").references(() => user.id, { onDelete: "set null" }),
  dailyInviteTarget: integer("daily_invite_target").notNull().default(0),
  publishChannels: jsonb("publish_channels").$type<string[]>(),
  // Populated once candidates exist; stored so the list card renders.
  candidates: integer("candidates").notNull().default(0),
  /** Hidden from lists and pickers; history retained. Never hard-deleted. */
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
