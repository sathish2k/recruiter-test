import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import { requestPasswordReset } from "../services/auth.service";
import {
  activateUser,
  deactivateUser,
  findAgencyUser,
  hasFreeSeat,
  inviteUser,
  isLastOwner,
  listUsers,
  removeUser,
  setUserSuspended,
  type UpdateUserInput,
  updateUser,
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

export async function patchUser(ctx: {
  user: Auth;
  params: { id: string };
  body: UpdateUserInput;
}) {
  const agencyId = ctx.user.agencyId ?? "";
  // Demoting the only active owner would leave the workspace unable to manage
  // billing or ownership at all, so it is refused before the write.
  if (ctx.body.role && ctx.body.role !== "owner" && (await isLastOwner(agencyId, ctx.params.id))) {
    return status(422, "This is the last active owner");
  }
  const updated = await updateUser(ctx.params.id, ctx.body);
  if (!updated) return status(404, "User not found");
  await recordAudit({
    organizationId: agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} updated ${updated.displayName}`,
    category: "permissions",
    objects: { Member: updated.displayName },
    details: {
      ...(ctx.body.role ? { "New role": ctx.body.role } : {}),
      ...(ctx.body.team !== undefined ? { Team: ctx.body.team || "None" } : {}),
    },
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

/** Sends the member the ordinary reset link. An admin never sets a password
 * for someone else — they only start the flow the member finishes. */
export async function postResetPassword(ctx: { user: Auth; params: { id: string } }) {
  const agencyId = ctx.user.agencyId ?? "";
  const target = await findAgencyUser(agencyId, ctx.params.id);
  if (!target) return status(404, "User not found");
  await requestPasswordReset(target.email);
  await recordAudit({
    organizationId: agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} sent ${target.name} a password reset`,
    category: "permissions",
    objects: { Member: target.name },
  });
  return { data: { id: target.id, email: target.email } };
}

export async function postActivate(ctx: { user: Auth; params: { id: string } }) {
  const agencyId = ctx.user.agencyId ?? "";
  // A reactivated member takes a seat again, so the plan has to have one.
  if (!(await hasFreeSeat(agencyId))) return status(422, "No seats available");
  const updated = await activateUser(agencyId, ctx.params.id);
  if (!updated) return status(404, "User not found");
  await recordAudit({
    organizationId: agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${ctx.user.name ?? "Someone"} reactivated ${updated.displayName}`,
    category: "permissions",
    objects: { Member: updated.displayName },
  });
  return { data: updated };
}

export async function postDeactivate(ctx: { user: Auth; params: { id: string } }) {
  if (ctx.params.id === ctx.user.id) {
    return status(422, "You can't deactivate yourself");
  }
  if (await isLastOwner(ctx.user.agencyId ?? "", ctx.params.id)) {
    return status(422, "This is the last active owner");
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
