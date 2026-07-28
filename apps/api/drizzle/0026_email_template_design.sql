ALTER TABLE "email_template" ADD COLUMN "category" text DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_template" ADD COLUMN "preheader" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_template" ADD COLUMN "heading" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_template" ADD COLUMN "cta_url" text DEFAULT '{action_url}' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_template" ADD COLUMN "sample_to" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_template" ADD COLUMN "status" text DEFAULT 'enabled' NOT NULL;--> statement-breakpoint
UPDATE "email_template" SET "status" = CASE WHEN "enabled" THEN 'enabled' ELSE 'disabled' END;--> statement-breakpoint
ALTER TABLE "email_template" DROP COLUMN "enabled";--> statement-breakpoint
DELETE FROM "email_template" WHERE "key" IN ('application_received', 'interview_invite', 'interview_reminder', 'offer_extended', 'application_declined', 'onboarding_welcome');--> statement-breakpoint
DELETE FROM "email_template" a USING "email_template" b WHERE a."agency_id" = b."agency_id" AND a."key" = b."key" AND a."created_at" > b."created_at";--> statement-breakpoint
CREATE UNIQUE INDEX "email_template_agency_key_idx" ON "email_template" USING btree ("agency_id","key");
