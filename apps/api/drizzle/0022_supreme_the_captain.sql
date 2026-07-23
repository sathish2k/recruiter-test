ALTER TABLE "candidate" ALTER COLUMN "status" SET DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "formatted_resume" jsonb;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "cover_letter" jsonb;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "offer" jsonb;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "contracts" jsonb;--> statement-breakpoint
ALTER TABLE "candidate" ADD COLUMN "email_opt_out" boolean DEFAULT false NOT NULL;