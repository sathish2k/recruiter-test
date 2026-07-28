import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { job } from "./job.model";
import { organization } from "./organization.model";

export type CandidateStatus = "new" | "active" | "placed" | "on_hold" | "rejected";

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
  institution?: string;
  major?: string;
  degree?: string;
  fromMonth?: string;
  fromYear?: string;
  toMonth?: string;
  toYear?: string;
  currentlyPursuing?: boolean;
}

export interface Experience {
  jobTitle?: string;
  company?: string;
  summary?: string;
  fromMonth?: string;
  fromYear?: string;
  toMonth?: string;
  toYear?: string;
  current?: boolean;
}

/** A person the agency is placing. */
export const candidate = pgTable("candidate", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  salutation: text("salutation"),
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
  github: text("github"),
  stackOverflow: text("stack_overflow"),
  /** How long before they could start, e.g. "30_days". */
  noticePeriod: text("notice_period"),
  /** Right to work in the hiring country, e.g. "citizen" / "needs_sponsorship". */
  workAuthorization: text("work_authorization"),
  preferredLocation: text("preferred_location"),
  /** §4 of the flow doc — availability is separate from placement history. */
  availability: text("availability"),
  availableFrom: timestamp("available_from"),
  /** Set from placement + the client's off-limits term (TC-CLI-007). */
  offLimitsUntil: timestamp("off_limits_until"),
  tags: jsonb("tags").$type<string[]>(),
  /** Blocks every outbound channel (TC-CAN-010). */
  doNotContact: boolean("do_not_contact").notNull().default(false),
  /** When and how the candidate consented to be held on file. */
  consentAt: timestamp("consent_at"),
  consentSource: text("consent_source"),
  salaryCurrency: text("salary_currency"),
  openToRelocate: boolean("open_to_relocate").notNull().default(false),
  openToRemote: boolean("open_to_remote").notNull().default(false),
  education: jsonb("education").$type<Education[]>(),
  experience: jsonb("experience").$type<Experience[]>(),
  resume: jsonb("resume").$type<CandidateAttachment[]>(),
  formattedResume: jsonb("formatted_resume").$type<CandidateAttachment[]>(),
  coverLetter: jsonb("cover_letter").$type<CandidateAttachment[]>(),
  offer: jsonb("offer").$type<CandidateAttachment[]>(),
  contracts: jsonb("contracts").$type<CandidateAttachment[]>(),
  attachments: jsonb("attachments").$type<CandidateAttachment[]>(),
  jobId: text("job_id").references(() => job.id, { onDelete: "set null" }),
  startingStage: text("starting_stage"),
  matchScore: integer("match_score"),
  reminderSentAt: timestamp("reminder_sent_at"),
  status: text("status").$type<CandidateStatus>().notNull().default("new"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  source: text("source"),
  emailOptOut: boolean("email_opt_out").notNull().default(false),
  /** Hidden from lists and pickers; history retained. Never hard-deleted. */
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
