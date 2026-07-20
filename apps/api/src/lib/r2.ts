import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 over the S3 API. Mirrors the Mailjet lib: unconfigured is a
 * first-class state, so the app boots and every other feature keeps working.
 */

let client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    (process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT) &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

function bucket(): string {
  const name = process.env.R2_BUCKET;
  if (!name) throw new Error("R2_BUCKET is not set");
  return name;
}

function getClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  // R2_ENDPOINT overrides the derived endpoint — used to point local dev at an
  // S3-compatible server instead of hitting the real bucket.
  const override = process.env.R2_ENDPOINT;
  if (!accessKeyId || !secretAccessKey || !(accountId || override)) {
    throw new Error("R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are not set");
  }
  if (!client) {
    client = new S3Client({
      // R2 ignores the region but the SDK insists on one.
      region: "auto",
      endpoint: override ?? `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      // Local S3 servers are path-style; R2 handles both.
      forcePathStyle: Boolean(override),
    });
  }
  return client;
}

export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  /** Long-lived for content-addressed public assets; short for the rest. */
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export async function putObject(input: PutObjectInput): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl,
      Metadata: input.metadata,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/** Short-lived download URL for private objects. Default 5 minutes. */
export async function signedDownloadUrl(
  key: string,
  { expiresIn = 300, filename }: { expiresIn?: number; filename?: string } = {},
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
    // Makes the browser save it under the name the uploader recognises, even
    // though the stored key is deterministic.
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

/**
 * Public URL via the custom domain (`https://assets.hirepilotx.com/...`).
 * Returns null when no public base is configured, so callers fall back to a
 * signed URL rather than emitting a broken link.
 */
export function publicUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}
