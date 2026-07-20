ALTER TABLE "organization" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "placement_fee" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "white_label" boolean DEFAULT true NOT NULL;