import { status } from "elysia";
import { deactivateUser, inviteUser, listUsers, updateUserRole } from "../services/user.service";

type Auth = { id: string; agencyId?: string | null; role?: string | null };

export async function getUsers(ctx: { user: Auth }) {
  const { data, totalCount } = await listUsers(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}

export async function patchUserRole(ctx: { params: { id: string }; body: { role: string } }) {
  const updated = await updateUserRole(ctx.params.id, ctx.body.role);
  if (!updated) return status(404, "User not found");
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
  return { data: updated };
}
