CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"client_id" text,
	"client_contact_id" text,
	"date_opened" text,
	"target_date" text,
	"employment_type" text,
	"work_experience" text,
	"industry" text,
	"openings" integer DEFAULT 1 NOT NULL,
	"salary_min" text,
	"salary_max" text,
	"status" text DEFAULT 'open' NOT NULL,
	"address" jsonb,
	"revenue_per_position" text,
	"actual_revenue" text,
	"missed_revenue" text,
	"job_summary" jsonb,
	"attachments" jsonb,
	"ai_screening" boolean DEFAULT false NOT NULL,
	"screening_criteria" text,
	"sourcer_id" text,
	"profile_lead_id" text,
	"daily_invite_target" integer DEFAULT 0 NOT NULL,
	"publish_channels" jsonb,
	"candidates" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_client_contact_id_contact_id_fk" FOREIGN KEY ("client_contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_sourcer_id_user_id_fk" FOREIGN KEY ("sourcer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_profile_lead_id_user_id_fk" FOREIGN KEY ("profile_lead_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;