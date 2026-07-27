import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { candidate } from "./candidate.model";
import { client } from "./client.model";
import { job } from "./job.model";
import { organization } from "./organization.model";

export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";

/** A scheduled conversation with a candidate. `kind` is the round — the label
 * the dashboard shows next to the slot ("Client panel", "Screening"). */
export const interview = pgTable("interview", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id").references(() => candidate.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => job.id, { onDelete: "set null" }),
  clientId: text("client_id").references(() => client.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  kind: text("kind").notNull().default("screening"),
  meetingUrl: text("meeting_url"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  status: text("status").$type<InterviewStatus>().notNull().default("scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
