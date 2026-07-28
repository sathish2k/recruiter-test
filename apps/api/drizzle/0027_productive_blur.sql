CREATE TABLE "email_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sends_this_hour" integer DEFAULT 1 NOT NULL,
	"hour_started_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"candidate_id" text,
	"job_id" text,
	"client_id" text,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"kind" text DEFAULT 'screening' NOT NULL,
	"meeting_url" text,
	"owner_id" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_stage" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"client_visible" boolean DEFAULT false NOT NULL,
	"sla_days" integer DEFAULT 0 NOT NULL,
	"kind" text DEFAULT 'middle' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rejection_reason" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"category" text NOT NULL,
	"label" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequence" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"kind" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "stack_overflow" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "notice_period" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "work_authorization" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "preferred_location" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "availability" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "available_from" timestamp;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "off_limits_until" timestamp;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "do_not_contact" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "consent_at" timestamp;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "consent_source" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "salary_currency" text;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "open_to_relocate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "open_to_remote" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "match_score" integer;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "merged_into_id" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "billing_currency" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "tax_treatment" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "off_limits_months" integer;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "career_page" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "company_size" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "annual_hiring_volume" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "replacement_period" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "contract_renews_at" text;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "preferred_channel" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "assistant" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "phone_opt_out" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "nice_to_have_skills" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "salary_currency" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "remote" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "knockout_questions" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "stage_slas" jsonb;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "role_category" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "work_model" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "priority" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stage" ADD CONSTRAINT "pipeline_stage_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rejection_reason" ADD CONSTRAINT "rejection_reason_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence" ADD CONSTRAINT "sequence_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "knockout_count";
