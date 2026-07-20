CREATE TABLE "email_template" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"key" text NOT NULL,
	"icon" text DEFAULT 'mail' NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cta" text DEFAULT '' NOT NULL,
	"footer" text DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
