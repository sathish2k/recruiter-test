import { status } from "elysia";
import {
  listPermissions,
  roleHolders,
  updateRolePermissions,
} from "../services/permission.service";

type Auth = { agencyId?: string | null };

export async function getPermissions(ctx: { user: Auth }) {
  const agencyId = ctx.user.agencyId ?? "";
  const [data, holders] = await Promise.all([listPermissions(agencyId), roleHolders(agencyId)]);
  return { data, meta: { holders } };
}

export async function putRolePermissions(ctx: {
  user: Auth;
  params: { role: string };
  body: { permissions: { resource: string; actions: string[] }[] };
}) {
  const updated = await updateRolePermissions(
    ctx.user.agencyId ?? "",
    ctx.params.role,
    ctx.body.permissions,
  );
  if (!updated) return status(422, "Unknown role");
  return { data: updated };
}
