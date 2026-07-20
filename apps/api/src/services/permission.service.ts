import { DEFAULT_ROLE_PERMISSIONS } from "@recruit/types";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { rolePermission } from "../models/role-permission.model";

const ROLES = Object.keys(DEFAULT_ROLE_PERMISSIONS);

type PermMap = Record<string, string[]>;

function mapToList(map: PermMap) {
  return Object.entries(map).map(([resource, actions]) => ({ resource, actions }));
}

function listToMap(list: { resource: string; actions: string[] }[]): PermMap {
  const map: PermMap = {};
  for (const { resource, actions } of list) map[resource] = actions;
  return map;
}

const rowId = (agencyId: string, role: string) => `${agencyId}:${role}`;

// Idempotently create per-role rows for a new agency from the defaults.
export async function seedAgencyPermissions(agencyId: string): Promise<void> {
  await Promise.all(
    ROLES.map((role) =>
      db
        .insert(rolePermission)
        .values({
          id: rowId(agencyId, role),
          agencyId,
          role,
          permissions: (DEFAULT_ROLE_PERMISSIONS[role] ?? {}) as PermMap,
        })
        .onConflictDoNothing(),
    ),
  );
}

export async function listPermissions(agencyId: string) {
  let rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));
  if (rows.length === 0) {
    await seedAgencyPermissions(agencyId);
    rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));
  }
  return ROLES.map((role) => {
    const row = rows.find((r) => r.role === role);
    return {
      role,
      permissions: mapToList(row?.permissions ?? DEFAULT_ROLE_PERMISSIONS[role] ?? {}),
    };
  });
}

export async function updateRolePermissions(
  agencyId: string,
  role: string,
  permissions: { resource: string; actions: string[] }[],
) {
  if (!ROLES.includes(role)) return null;
  const map = listToMap(permissions);
  await db
    .insert(rolePermission)
    .values({ id: rowId(agencyId, role), agencyId, role, permissions: map })
    .onConflictDoUpdate({ target: rolePermission.id, set: { permissions: map } });
  return { role, permissions: mapToList(map) };
}
