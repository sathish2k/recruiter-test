import {
  type AccessAction,
  DEFAULT_ROLE_PERMISSIONS,
  type RolePermissions,
  type UserRole,
} from "@recruit/types";
import {
  type ResourcePermission,
  RolePermissionModel,
} from "../models/role-permission.model";

const ROLES = Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[];

function mapToList(map: RolePermissions): ResourcePermission[] {
  return Object.entries(map).map(([resource, actions]) => ({
    resource,
    actions,
  }));
}

function listToMap(list: ResourcePermission[]): RolePermissions {
  const map: RolePermissions = {};
  for (const { resource, actions } of list) map[resource] = actions;
  return map;
}

/** Creates the per-role permission docs for a new agency from the defaults.
 * Idempotent — existing docs are left untouched. */
export async function seedAgencyPermissions(agencyId: string): Promise<void> {
  await Promise.all(
    ROLES.map((role) =>
      RolePermissionModel.updateOne(
        { agencyId, role },
        {
          $setOnInsert: {
            agencyId,
            role,
            permissions: mapToList(DEFAULT_ROLE_PERMISSIONS[role] ?? {}),
          },
        },
        { upsert: true },
      ),
    ),
  );
}

export async function listPermissions(agencyId: string) {
  let docs = await RolePermissionModel.find({ agencyId }).lean();
  if (docs.length === 0) {
    await seedAgencyPermissions(agencyId);
    docs = await RolePermissionModel.find({ agencyId }).lean();
  }
  return ROLES.map((role) => {
    const doc = docs.find((d) => d.role === role);
    return {
      role,
      permissions:
        doc?.permissions ?? mapToList(DEFAULT_ROLE_PERMISSIONS[role] ?? {}),
    };
  });
}

/** The permission map for one role, used by the web `accessResolver`. Falls
 * back to the static defaults for unknown/legacy roles. */
export async function getRolePermissions(
  agencyId: string,
  role: string,
): Promise<RolePermissions> {
  const doc = await RolePermissionModel.findOne({
    agencyId,
    role: role as UserRole,
  }).lean();
  if (doc) return listToMap(doc.permissions);
  if (role in DEFAULT_ROLE_PERMISSIONS) {
    await seedAgencyPermissions(agencyId);
    return DEFAULT_ROLE_PERMISSIONS[role] ?? {};
  }
  return {};
}

export async function updateRolePermissions(
  agencyId: string,
  role: string,
  permissions: ResourcePermission[],
): Promise<RolePermissions | null> {
  if (!ROLES.includes(role as UserRole)) return null;
  const clean = permissions.map((p) => ({
    resource: p.resource,
    actions: (p.actions ?? []).filter((a): a is AccessAction =>
      ["read", "create", "edit", "update", "delete"].includes(a),
    ),
  }));
  const doc = await RolePermissionModel.findOneAndUpdate(
    { agencyId, role: role as UserRole },
    { $set: { permissions: clean } },
    { new: true, upsert: true },
  ).lean();
  return doc ? listToMap(doc.permissions) : null;
}
