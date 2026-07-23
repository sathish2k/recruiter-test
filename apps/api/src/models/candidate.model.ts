import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { job } from "./job.model";
import { organization } from "./organization.model";

export type CandidateStatus = "active" | "placed" | "on_hold" | "rejected";

export interface CandidateAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CandidateAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface Education {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  year?: string;
}

export interface Experience {
  company?: string;
  jobTitle?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

/** A person the agency is placing. */
export const candidate = pgTable("candidate", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email"),
  secondaryEmail: text("secondary_email"),
  phone: text("phone"),
  mobile: text("mobile"),
  website: text("website"),
  address: jsonb("address").$type<CandidateAddress>(),
  experienceYears: text("experience_years"),
  highestQualification: text("highest_qualification"),
  currentJobTitle: text("current_job_title"),
  currentEmployer: text("current_employer"),
  currentSalary: text("current_salary"),
  expectedSalary: text("expected_salary"),
  skillSet: jsonb("skill_set").$type<string[]>(),
  additionalInfo: text("additional_info"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  education: jsonb("education").$type<Education[]>(),
  experience: jsonb("experience").$type<Experience[]>(),
  resume: jsonb("resume").$type<CandidateAttachment[]>(),
  attachments: jsonb("attachments").$type<CandidateAttachment[]>(),
  jobId: text("job_id").references(() => job.id, { onDelete: "set null" }),
  startingStage: text("starting_stage"),
  status: text("status").$type<CandidateStatus>().notNull().default("active"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
