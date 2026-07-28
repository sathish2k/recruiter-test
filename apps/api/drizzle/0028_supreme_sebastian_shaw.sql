CREATE TABLE "application" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"job_id" text NOT NULL,
	"stage_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"owner_id" text,
	"consent_at" timestamp,
	"consent_source" text,
	"rejection_reason_id" text,
	"rejection_note" text,
	"closed_at" timestamp,
	"stage_entered_at" timestamp DEFAULT now() NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_stage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"application_id" text NOT NULL,
	"from_stage_id" text,
	"to_stage_id" text,
	"from_stage_name" text,
	"to_stage_name" text,
	"status" text DEFAULT 'active' NOT NULL,
	"reason_id" text,
	"reason_label" text,
	"note" text,
	"days_in_previous_stage" integer,
	"actor_id" text,
	"actor_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_stage_id_pipeline_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_rejection_reason_id_rejection_reason_id_fk" FOREIGN KEY ("rejection_reason_id") REFERENCES "public"."rejection_reason"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_stage_history" ADD CONSTRAINT "application_stage_history_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_stage_history" ADD CONSTRAINT "application_stage_history_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_candidate_job_unique" ON "application" USING btree ("candidate_id","job_id");--> statement-breakpoint
CREATE INDEX "application_job_stage_idx" ON "application" USING btree ("job_id","stage_id");--> statement-breakpoint
CREATE INDEX "application_org_status_idx" ON "application" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "application_history_application_idx" ON "application_stage_history" USING btree ("application_id");