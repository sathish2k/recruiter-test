import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  deactivateUser,
  inviteUser,
  listUsers,
  removeUser,
  setUserSuspended,
  updateUserRole,
} from "../services/user.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null; role?: string | null };

export async function getUsers(ctx: { user: Auth; query?: Record<string, string | undefined> }) {
  const { data, totalCount, meta } = await listUsers(
    ctx.user.agencyId ?? "",
    ctx.query ?? {},
    ctx.user.id,
  );
  return { data, meta: { totalCount, ...meta } };
}

export async function patchUserRole(ctx: {
  user: Auth;
  params: { id: string };
  body: { role: string };
}) {
  const updated = await updateUserRole(ctx.params.id, ctx.body.role);
  if (!updated) return status(404, "User not found");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} changed ${updated.displayName}'s role`,
    category: "permissions",
    objects: { Member: updated.displayName },
    details: { "New role": ctx.body.role },
  });
  return { data: updated };
}

export async function postInvite(ctx: { user: Auth; body: { email: string; role: string } }) {
  try {
    const created = await inviteUser(ctx.user.agencyId ?? "", ctx.body.email, ctx.body.role);
    if (!created) return status(422, "Unknown role");
    return status(201, { data: created });
  } catch (e) {
    const message = (e as { message?: string }).message ?? "";
    if (/unique|duplicate|already exists/i.test(message)) {
      return status(409, "Email already invited");
    }
    throw e;
  }
}

export async function postDeactivate(ctx: { user: Auth; params: { id: string } }) {
  if (ctx.params.id === ctx.user.id) {
    return status(422, "You can't deactivate yourself");
  }
  const updated = await deactivateUser(ctx.params.id);
  if (!updated) return status(404, "User not found");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} deactivated ${updated.displayName}`,
    category: "permissions",
    severity: "warning",
    objects: { Member: updated.displayName },
  });
  return { data: updated };
}

export async function postSuspend(ctx: {
  user: Auth;
  params: { id: string };
  // Unvalidated on this route — the flag is optional and defaults to suspend.
  body?: unknown;
}) {
  if (ctx.params.id === ctx.user.id) return status(422, "You can't suspend yourself");
  const suspended = (ctx.body as { suspended?: boolean } | undefined)?.suspended !== false;
  const updated = await setUserSuspended(ctx.params.id, suspended);
  if (!updated) return status(404, "User not found");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} ${suspended ? "suspended" : "restored"} ${updated.displayName}`,
    category: "permissions",
    ...(suspended ? { severity: "warning" as const } : {}),
    objects: { Member: updated.displayName },
  });
  return { data: updated };
}

export async function deleteMember(ctx: { user: Auth; params: { id: string } }) {
  if (ctx.params.id === ctx.user.id) return status(422, "You can't remove yourself");
  const removed = await removeUser(ctx.params.id);
  if (!removed) return status(404, "User not found");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} removed ${removed.displayName}`,
    category: "permissions",
    severity: "warning",
    objects: { Member: removed.displayName },
  });
  return { data: removed };
}
