import { status } from "elysia";
import type { ResourcePermission } from "../models/role-permission.model";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  getRolePermissions,
  listPermissions,
  updateRolePermissions,
} from "../services/permission.service";

export async function getPermissions(ctx: { auth: AuthClaims }) {
  const data = await listPermissions(ctx.auth.agencyId);
  return { data };
}

export async function getMyPermissions(ctx: { auth: AuthClaims }) {
  const permissions = await getRolePermissions(
    ctx.auth.agencyId,
    ctx.auth.role,
  );
  return { data: { role: ctx.auth.role, permissions } };
}

export async function putRolePermissions(ctx: {
  auth: AuthClaims;
  params: { role: string };
  body: { permissions: ResourcePermission[] };
}) {
  const updated = await updateRolePermissions(
    ctx.auth.agencyId,
    ctx.params.role,
    ctx.body.permissions,
  );
  if (!updated) return status(422, "Unknown role");
  return { data: { role: ctx.params.role, permissions: updated } };
}
