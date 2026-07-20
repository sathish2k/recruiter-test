import { status } from "elysia";
import type { AssetEntityType, AssetType } from "../models/asset.model";
import * as assets from "../services/asset.service";
import { AssetError } from "../services/asset.service";
import { record as recordAudit } from "../services/audit-log.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

/** Maps a service error onto the right HTTP status. */
function toStatus(error: unknown) {
  if (error instanceof AssetError) {
    switch (error.code) {
      case "unconfigured":
        return status(503, "Object storage is not configured");
      case "too-large":
        return status(413, error.message);
      case "unsupported":
        return status(415, error.message);
      case "forbidden":
        return status(403, error.message);
      case "not-found":
        return status(404, error.message);
    }
  }
  throw error;
}

export async function getAssets(ctx: {
  user: Auth;
  query: { entityType?: string; entityId?: string; type?: string };
}) {
  const { data, totalCount } = await assets.listAssets(ctx.user.agencyId ?? "", {
    entityType: ctx.query.entityType as AssetEntityType | undefined,
    entityId: ctx.query.entityId,
    type: ctx.query.type as AssetType | undefined,
  });
  return { data, meta: { totalCount } };
}

export async function postAsset(ctx: {
  user: Auth;
  body: {
    file: File;
    entityType: string;
    entityId?: string;
    type: string;
  };
}) {
  const { file } = ctx.body;
  // A member's avatar and an org's logo default to the caller / their org, so
  // the client doesn't have to restate ids it already implies.
  const entityId =
    ctx.body.entityId ??
    (ctx.body.entityType === "member" ? ctx.user.id : (ctx.user.agencyId ?? ""));

  try {
    const created = await assets.uploadAsset({
      organizationId: ctx.user.agencyId ?? "",
      uploadedBy: ctx.user.id,
      entityType: ctx.body.entityType as AssetEntityType,
      entityId,
      type: ctx.body.type as AssetType,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "application/octet-stream",
      originalFilename: file.name,
    });
    if (!created) return status(422, "Could not store the file");

    await recordAudit({
      organizationId: ctx.user.agencyId ?? "",
      userId: ctx.user.id,
      actorName: ctx.user.name ?? "Unknown",
      event: `Uploaded ${created.type} "${created.originalFilename}"`,
      category: "system",
      details: { Key: created.objectKey, Size: `${created.size} bytes` },
    });
    return status(201, { data: created });
  } catch (error) {
    return toStatus(error);
  }
}

/** Private files are never linked directly — the client asks for a short URL. */
export async function getAssetUrl(ctx: { user: Auth; params: { id: string } }) {
  try {
    const result = await assets.downloadUrlFor(ctx.user.agencyId ?? "", ctx.params.id);
    return { data: result };
  } catch (error) {
    return toStatus(error);
  }
}

export async function deleteAsset(ctx: { user: Auth; params: { id: string } }) {
  try {
    const removed = await assets.deleteAsset(ctx.user.agencyId ?? "", ctx.params.id);
    await recordAudit({
      organizationId: ctx.user.agencyId ?? "",
      userId: ctx.user.id,
      actorName: ctx.user.name ?? "Unknown",
      event: `Deleted a stored file`,
      category: "system",
      severity: "warning",
      details: { Key: removed.objectKey },
    });
    return { data: removed };
  } catch (error) {
    return toStatus(error);
  }
}
