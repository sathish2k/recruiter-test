CREATE TABLE "candidate" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text,
	"secondary_email" text,
	"phone" text,
	"mobile" text,
	"website" text,
	"address" jsonb,
	"experience_years" text,
	"highest_qualification" text,
	"current_job_title" text,
	"current_employer" text,
	"current_salary" text,
	"expected_salary" text,
	"skill_set" jsonb,
	"additional_info" text,
	"linkedin" text,
	"twitter" text,
	"education" jsonb,
	"experience" jsonb,
	"resume" jsonb,
	"attachments" jsonb,
	"job_id" text,
	"starting_stage" text,
	"status" text DEFAULT 'active' NOT NULL,
	"owner_id" text,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;