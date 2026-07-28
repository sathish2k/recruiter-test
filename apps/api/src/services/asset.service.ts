import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import sharp from "sharp";
import { db } from "../db";
import { extensionFor, isOwnedBy, isPublicType, objectKey, safeFilename } from "../lib/object-key";
import {
  deleteObject,
  isStorageConfigured,
  publicUrl,
  putObject,
  signedDownloadUrl,
} from "../lib/r2";
import { type AssetEntityType, type AssetType, asset } from "../models/asset.model";

type AssetRow = typeof asset.$inferSelect;

/**
 * Target box per image asset — keeps storage and bandwidth down.
 * `cover` crops to an exact square (right for avatars); `inside` fits within
 * the box preserving aspect ratio (right for logos — a wide wordmark must not
 * be cropped into a square).
 */
const IMAGE_SIZES: Partial<Record<AssetType, { size: number; fit: "cover" | "inside" }>> = {
  avatar: { size: 256, fit: "cover" },
  logo: { size: 512, fit: "inside" },
  "client-logo": { size: 512, fit: "inside" },
};

const MAX_BYTES: Record<string, number> = {
  image: 5 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

export class AssetError extends Error {
  constructor(
    message: string,
    readonly code: "unconfigured" | "too-large" | "unsupported" | "forbidden" | "not-found",
  ) {
    super(message);
  }
}

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "text/plain",
]);

/**
 * Converts logos and avatars to WebP, cover-fitted into a square box. Returns
 * the transcoded buffer plus the content type actually stored.
 */
async function normaliseImage(body: Buffer, type: AssetType) {
  const spec = IMAGE_SIZES[type];
  if (!spec) return { body, contentType: "application/octet-stream" };
  const out = await sharp(body)
    .rotate() // honour EXIF orientation before resizing
    .resize(spec.size, spec.size, { fit: spec.fit, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { body: out, contentType: "image/webp" };
}

export interface UploadInput {
  organizationId: string;
  uploadedBy: string;
  entityType: AssetEntityType;
  entityId: string;
  type: AssetType;
  body: Buffer;
  contentType: string;
  originalFilename: string;
}

/** Builds the R2 key for an upload from its entity + type. */
function keyFor(input: UploadInput, storedContentType: string): string {
  const { organizationId: org, entityId, type, originalFilename } = input;
  const ext = extensionFor(storedContentType, "bin");
  switch (type) {
    case "logo":
      return objectKey.organizationLogo(org);
    case "avatar":
      return objectKey.memberAvatar(org, entityId);
    case "client-logo":
      return objectKey.clientLogo(org, entityId);
    case "resume":
      return objectKey.candidateResume(org, entityId, ext);
    case "cover-letter":
      return objectKey.candidateCoverLetter(org, entityId, ext);
    case "attachment":
      return objectKey.candidateAttachment(org, entityId, originalFilename);
    case "jd":
      return objectKey.jobDescription(org, entityId, ext);
    case "report":
      return objectKey.report(org, originalFilename);
    case "template":
      return objectKey.template(org, originalFilename);
    case "email":
      return objectKey.email(org, originalFilename);
    case "import":
      return objectKey.import(org, originalFilename);
    case "export":
      return objectKey.export(org, originalFilename);
  }
}

export async function uploadAsset(rawInput: UploadInput) {
  if (!isStorageConfigured()) {
    throw new AssetError("Object storage is not configured", "unconfigured");
  }

  // A browser sends "text/plain;charset=utf-8" for text parts — the parameters
  // are not part of the type, so strip them before the allow-list check.
  const input = { ...rawInput, contentType: (rawInput.contentType.split(";")[0] ?? "").trim() };
  const isImage = IMAGE_TYPES.has(input.contentType);
  const isDocument = DOCUMENT_TYPES.has(input.contentType);
  if (!isImage && !isDocument) {
    throw new AssetError(`Unsupported file type: ${input.contentType}`, "unsupported");
  }
  const limit = isImage ? MAX_BYTES.image : MAX_BYTES.document;
  if (limit && input.body.byteLength > limit) {
    throw new AssetError("File is too large", "too-large");
  }

  // Images destined for a sized slot become WebP; everything else is stored
  // byte-for-byte.
  const converted =
    isImage && IMAGE_SIZES[input.type]
      ? await normaliseImage(input.body, input.type)
      : { body: input.body, contentType: input.contentType };

  const key = keyFor(input, converted.contentType);
  const isPublic = isPublicType(input.type);

  await putObject({
    key,
    body: converted.body,
    contentType: converted.contentType,
    cacheControl: isPublic ? "public, max-age=31536000, immutable" : "private, max-age=0",
    metadata: { organizationId: input.organizationId, uploadedBy: input.uploadedBy },
  });

  const [row] = await db
    .insert(asset)
    .values({
      id: randomUUID(),
      organizationId: input.organizationId,
      entityType: input.entityType,
      entityId: input.entityId,
      type: input.type,
      objectKey: key,
      contentType: converted.contentType,
      size: converted.body.byteLength,
      originalFilename: safeFilename(input.originalFilename),
      isPublic,
      uploadedBy: input.uploadedBy,
    })
    .onConflictDoUpdate({
      target: [asset.organizationId, asset.objectKey],
      set: {
        contentType: converted.contentType,
        size: converted.body.byteLength,
        originalFilename: safeFilename(input.originalFilename),
        uploadedBy: input.uploadedBy,
        updatedAt: new Date(),
      },
    })
    .returning();

  return row ? await present(row) : null;
}

/** Shapes a row for the client, resolving the right kind of URL. */
async function present(row: AssetRow) {
  return {
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    type: row.type,
    objectKey: row.objectKey,
    contentType: row.contentType,
    size: row.size,
    originalFilename: row.originalFilename,
    isPublic: row.isPublic,
    // Public assets get a stable custom-domain URL; private ones are only ever
    // handed out as short-lived signed links.
    url: row.isPublic ? publicUrl(row.objectKey) : null,
    createdAt: row.createdAt,
  };
}

export async function listAssets(
  organizationId: string,
  filters: { entityType?: AssetEntityType; entityId?: string; type?: AssetType } = {},
) {
  const where = [eq(asset.organizationId, organizationId)];
  if (filters.entityType) where.push(eq(asset.entityType, filters.entityType));
  if (filters.entityId) where.push(eq(asset.entityId, filters.entityId));
  if (filters.type) where.push(eq(asset.type, filters.type));

  const rows = await db
    .select()
    .from(asset)
    .where(and(...where))
    .orderBy(desc(asset.createdAt));
  const data = await Promise.all(rows.map(present));
  return { data, totalCount: data.length };
}

export async function findAsset(organizationId: string, id: string) {
  const [row] = await db
    .select()
    .from(asset)
    .where(and(eq(asset.id, id), eq(asset.organizationId, organizationId)));
  return row ?? null;
}

/**
 * Mints a download URL. The org check is belt-and-braces: the row is already
 * scoped by organization, and the key must also sit under that org's prefix.
 */
export async function downloadUrlFor(organizationId: string, id: string, expiresIn = 300) {
  if (!isStorageConfigured()) {
    throw new AssetError("Object storage is not configured", "unconfigured");
  }
  const row = await findAsset(organizationId, id);
  if (!row) throw new AssetError("Asset not found", "not-found");
  if (!isOwnedBy(row.objectKey, organizationId)) {
    throw new AssetError("Asset does not belong to this organization", "forbidden");
  }
  if (row.isPublic) {
    const url = publicUrl(row.objectKey);
    if (url) return { url, expiresIn: null as number | null };
  }
  const url = await signedDownloadUrl(row.objectKey, {
    expiresIn,
    filename: row.originalFilename ?? undefined,
  });
  return { url, expiresIn };
}

export async function deleteAsset(organizationId: string, id: string) {
  const row = await findAsset(organizationId, id);
  if (!row) throw new AssetError("Asset not found", "not-found");
  if (!isOwnedBy(row.objectKey, organizationId)) {
    throw new AssetError("Asset does not belong to this organization", "forbidden");
  }
  if (isStorageConfigured()) await deleteObject(row.objectKey);
  await db.delete(asset).where(eq(asset.id, row.id));
  return { id: row.id, objectKey: row.objectKey };
}
