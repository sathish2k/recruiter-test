ALTER TABLE "contact" ADD COLUMN "secondary_email" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "mobile" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "email_opt_out" boolean DEFAULT false NOT NULL;