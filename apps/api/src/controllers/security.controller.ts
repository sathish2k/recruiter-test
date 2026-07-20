import { status } from "elysia";
import * as audit from "../services/audit-log.service";
import * as security from "../services/security.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };
type Ctx<Extra = unknown> = {
  user: Auth;
  headers: Record<string, string | undefined>;
} & Extra;

/** Identifies the caller's own session so we can mark it `Current` and spare it
 * from "sign out everywhere". The web app calls the API cross-origin with a
 * bearer token, so that comes first; the cookie is the same-origin fallback. */
function currentToken(headers: Record<string, string | undefined>) {
  const bearer = headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer.split(".")[0];
  const cookie = headers.cookie ?? "";
  const raw = /better-auth\.session_token=([^;]+)/.exec(cookie)?.[1];
  return raw ? decodeURIComponent(raw).split(".")[0] : undefined;
}

function clientIp(headers: Record<string, string | undefined>) {
  return headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? null;
}

export async function getSecurity(ctx: Ctx) {
  const data = await security.getSecurityOverview(
    ctx.user.id,
    ctx.user.agencyId ?? "",
    currentToken(ctx.headers),
  );
  return { data };
}

export async function deleteSession(ctx: Ctx<{ params: { id: string } }>) {
  const revoked = await security.revokeSession(ctx.user.id, ctx.params.id);
  if (!revoked) return status(404, "Session not found");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Signed out ${revoked.device} (${revoked.browser})`,
    category: "security",
    ip: clientIp(ctx.headers),
    objects: { Device: revoked.device },
  });
  return { data: revoked };
}

export async function deleteOtherSessions(ctx: Ctx) {
  const count = await security.revokeOtherSessions(ctx.user.id, currentToken(ctx.headers));
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Signed out ${count} other device${count === 1 ? "" : "s"}`,
    category: "security",
    ip: clientIp(ctx.headers),
  });
  return { data: { count } };
}

export async function getLoginHistory(ctx: Ctx<{ query: { result?: string } }>) {
  const { data, totalCount } = await security.listLoginHistory(ctx.user.id, ctx.query.result);
  return { data, meta: { totalCount } };
}

export async function postToken(
  ctx: Ctx<{ body?: { name?: string; expiresInDays?: number } | null }>,
) {
  const created = await security.createToken(ctx.user.agencyId ?? "", ctx.user.id, ctx.body ?? {});
  if (!created) return status(422, "Could not create token");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Created personal access token "${created.name}"`,
    category: "security",
    ip: clientIp(ctx.headers),
    objects: { Token: created.name },
  });
  return status(201, { data: created });
}

export async function deleteToken(ctx: Ctx<{ params: { id: string } }>) {
  const revoked = await security.revokeToken(ctx.user.id, ctx.params.id);
  if (!revoked) return status(404, "Token not found");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Revoked personal access token "${revoked.name}"`,
    category: "security",
    severity: "warning",
    ip: clientIp(ctx.headers),
    objects: { Token: revoked.name },
  });
  return { data: revoked };
}

export async function putTwoFactor(ctx: Ctx<{ body: { enabled: boolean } }>) {
  const updated = await security.setTwoFactor(ctx.user.id, ctx.body.enabled);
  if (!updated) return status(422, "Could not update two-factor");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: ctx.body.enabled
      ? "Enabled two-factor authentication"
      : "Disabled two-factor authentication",
    category: "security",
    severity: ctx.body.enabled ? "success" : "warning",
    ip: clientIp(ctx.headers),
  });
  return {
    data: {
      enabled: updated.twoFactorEnabled,
      recoveryCodes: updated.recoveryCodes ?? [],
    },
  };
}

export async function postRecoveryCodes(ctx: Ctx) {
  const codes = await security.regenerateRecoveryCodes(ctx.user.id);
  if (!codes) return status(422, "Could not generate recovery codes");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: "Regenerated two-factor recovery codes",
    category: "security",
    ip: clientIp(ctx.headers),
  });
  return { data: { recoveryCodes: codes } };
}

export async function putNotifications(
  ctx: Ctx<{
    body: Partial<{
      notifyNewDevice: boolean;
      notifyPasswordChange: boolean;
      notifyTwoFactorDisabled: boolean;
      notifySsoChange: boolean;
    }>;
  }>,
) {
  const updated = await security.updateNotifications(ctx.user.id, ctx.body);
  if (!updated) return status(422, "Could not update notifications");
  return { data: updated };
}

export async function postRecipient(ctx: Ctx<{ body: { email: string } }>) {
  const created = await security.addRecipient(ctx.user.agencyId ?? "", ctx.body.email);
  if (!created) return status(422, "Could not add recipient");
  await audit.record({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Added security alert recipient ${created.email}`,
    category: "security",
    ip: clientIp(ctx.headers),
  });
  return status(201, { data: created });
}

export async function deleteRecipient(ctx: Ctx<{ params: { id: string } }>) {
  const removed = await security.removeRecipient(ctx.user.agencyId ?? "", ctx.params.id);
  if (!removed) return status(404, "Recipient not found");
  return { data: removed };
}
