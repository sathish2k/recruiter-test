ALTER TABLE "client" ADD COLUMN "shipping_address" jsonb;--> statement-breakpoint
ALTER TABLE "client" ADD COLUMN "shipping_same_as_billing" boolean DEFAULT true NOT NULL;