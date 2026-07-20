CREATE TABLE "role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"role" text NOT NULL,
	"permissions" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notification_prefs" jsonb;