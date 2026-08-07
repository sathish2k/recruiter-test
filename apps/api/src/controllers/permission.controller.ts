import type { RecordScope } from "@recruit/types";
import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  createRole,
  deleteRole,
  listPermissions,
  roleCan,
  roleHolders,
  updateRolePermissions,
} from "../services/permission.service";

type Auth = {
  id?: string;
  name?: string;
  role?: string | null;
  agencyId?: string | null;
};

/**
 * The screen hides controls the caller may not use, but that is cosmetic — a
 * direct request has to be refused here.
 */
async function denyUnless(user: Auth, action: "manage" | "create") {
  const allowed = await roleCan(user.agencyId ?? "", user.role ?? "", "roles", action);
  return allowed ? null : status(403, "Requires the roles permission");
}

export async function getPermissions(ctx: { user: Auth }) {
  const agencyId = ctx.user.agencyId ?? "";
  const [data, holders] = await Promise.all([listPermissions(agencyId), roleHolders(agencyId)]);
  return { data, meta: { holders } };
}

export async function putRolePermissions(ctx: {
  user: Auth;
  params: { role: string };
  body: {
    permissions: { resource: string; actions: string[] }[];
    scope?: Record<string, string>;
  };
}) {
  const denied = await denyUnless(ctx.user, "manage");
  if (denied) return denied;

  const updated = await updateRolePermissions(ctx.user.agencyId ?? "", ctx.params.role, {
    permissions: ctx.body.permissions,
    scope: ctx.body.scope as Record<string, RecordScope> | undefined,
    actor: ctx.user.name,
  });
  if (!updated) return status(422, "Unknown role");

  await recordAudit({
    organizationId: ctx.user.agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name,
    event: "Role permissions updated",
    category: "permissions",
    objects: { role: ctx.params.role },
  });
  return { data: updated };
}

export async function postRole(ctx: {
  user: Auth;
  body: { label: string; description?: string; icon?: string; from?: string };
}) {
  const denied = await denyUnless(ctx.user, "create");
  if (denied) return denied;

  const created = await createRole(ctx.user.agencyId ?? "", {
    ...ctx.body,
    actor: ctx.user.name,
  });
  if ("error" in created) return status(409, "A role with that name already exists");

  await recordAudit({
    organizationId: ctx.user.agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name,
    event: "Role created",
    category: "permissions",
    objects: { role: created.role },
  });
  return { data: created };
}

const DELETE_ERRORS = {
  missing: [404, "Unknown role"],
  system: [422, "A role that ships with HirePilotX cannot be deleted"],
  unknownTarget: [422, "Unknown role to reassign members to"],
} as const;

export async function deleteRoleHandler(ctx: {
  user: Auth;
  params: { role: string };
  body?: { reassignTo?: string } | null;
}) {
  const denied = await denyUnless(ctx.user, "create");
  if (denied) return denied;

  const result = await deleteRole(
    ctx.user.agencyId ?? "",
    ctx.params.role,
    ctx.body?.reassignTo ?? "recruiter",
  );
  if ("error" in result) {
    const [code, message] = DELETE_ERRORS[result.error];
    return status(code, message);
  }

  await recordAudit({
    organizationId: ctx.user.agencyId,
    userId: ctx.user.id,
    actorName: ctx.user.name,
    event: "Role deleted",
    category: "permissions",
    severity: "warning",
    objects: { role: result.label },
    details: { movedTo: result.reassignedTo, members: String(result.moved) },
  });
  return { data: result };
}
