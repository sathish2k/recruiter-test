CREATE TABLE "industry" (
	"name" text PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO "industry" ("name", "sort_order") VALUES
	('Technology', 1),
	('Communications', 2),
	('Finance', 3),
	('Healthcare', 4),
	('Manufacturing', 5),
	('Retail', 6),
	('Education', 7),
	('Energy', 8),
	('Hospitality', 9),
	('Logistics', 10),
	('Media', 11),
	('Professional Services', 12),
	('Real Estate', 13),
	('Non-profit', 14)
ON CONFLICT ("name") DO NOTHING;
