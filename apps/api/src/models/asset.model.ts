import { boolean, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth.model";
import { organization } from "./organization.model";

export type AssetType =
  | "logo"
  | "avatar"
  | "resume"
  | "cover-letter"
  | "attachment"
  | "client-logo"
  | "jd"
  | "report"
  | "template"
  | "email"
  | "import"
  | "export";

export type AssetEntityType =
  | "organization"
  | "member"
  | "candidate"
  | "client"
  | "job"
  | "report"
  | "template"
  | "email"
  | "import"
  | "export";

/**
 * Metadata for every object in R2. The app never stores a URL — it stores
 * `objectKey` and mints a public or signed URL on read, so the bucket, custom
 * domain and access rules can all change without a data migration.
 */
export const asset = pgTable(
  "asset",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    entityType: text("entity_type").$type<AssetEntityType>().notNull(),
    /** Id of the row this belongs to (member id, candidate id, …). */
    entityId: text("entity_id").notNull(),
    type: text("type").$type<AssetType>().notNull(),
    /** The R2 key — what the app uses to retrieve the file. */
    objectKey: text("object_key").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull().default(0),
    /** What the uploader called it; used for the download filename. */
    originalFilename: text("original_filename"),
    /** Public assets are served off the custom domain; private ones are signed. */
    isPublic: boolean("is_public").notNull().default(false),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // One row per object: re-uploading a logo replaces it rather than
    // accumulating orphans.
    unique("asset_org_object_key").on(table.organizationId, table.objectKey),
  ],
);
