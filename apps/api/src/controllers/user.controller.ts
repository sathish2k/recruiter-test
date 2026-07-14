import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  deactivateUser,
  inviteUser,
  listUsers,
  updateUserRole,
} from "../services/user.service";

export async function getUsers(ctx: { auth: AuthClaims }) {
  const { data, totalCount } = await listUsers(ctx.auth.agencyId);
  return { data, meta: { totalCount } };
}

export async function patchUserRole(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { role: string };
}) {
  const updated = await updateUserRole(ctx.params.id, ctx.body.role);
  if (!updated) return status(404, "User not found");
  return { data: updated };
}

export async function postInvite(ctx: {
  auth: AuthClaims;
  body: { email: string; role: string };
}) {
  try {
    const created = await inviteUser(
      ctx.auth.agencyId,
      ctx.body.email,
      ctx.body.role,
    );
    if (!created) return status(422, "Unknown role");
    return status(201, { data: created });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return status(409, "Email already invited");
    }
    throw e;
  }
}

export async function postDeactivate(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  if (ctx.params.id === ctx.auth.sub) {
    return status(422, "You can't deactivate yourself");
  }
  const updated = await deactivateUser(ctx.params.id);
  if (!updated) return status(404, "User not found");
  return { data: updated };
}
