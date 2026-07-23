CREATE TABLE "client" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"website" text,
	"phone" text,
	"billing_email" text,
	"address" jsonb,
	"account_lead_id" text,
	"source" text,
	"fee_basis" text,
	"fee_value" text,
	"payment_terms" text,
	"tax_id" text,
	"notes" text,
	"status" text DEFAULT 'hiring' NOT NULL,
	"health" text DEFAULT 'healthy' NOT NULL,
	"logo" text,
	"open_roles" integer DEFAULT 0 NOT NULL,
	"candidates" integer DEFAULT 0 NOT NULL,
	"placements" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_account_lead_id_user_id_fk" FOREIGN KEY ("account_lead_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;