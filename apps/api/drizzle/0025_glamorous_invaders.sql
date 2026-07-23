ALTER TABLE "job" ADD COLUMN "match_threshold" integer DEFAULT 80 NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "auto_advance" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "knockout_count" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "daily_digest" boolean DEFAULT true NOT NULL;