import {
  type AccessAction,
  DEFAULT_ROLE_PERMISSIONS,
  defaultScopesFor,
  LEGACY_ROLES,
  type RecordScope,
} from "@recruit/types";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { rolePermission } from "../models/role-permission.model";

const BUILT_IN_ROLES = Object.keys(DEFAULT_ROLE_PERMISSIONS);

type PermMap = Record<string, string[]>;
type ScopeMap = Record<string, string>;

export interface PermissionEntry {
  resource: string;
  actions: string[];
}

export interface RoleRecord {
  role: string;
  system: boolean;
  label: string | null;
  description: string | null;
  icon: string | null;
  permissions: PermissionEntry[];
  scope: ScopeMap;
  updatedAt: string | null;
  updatedBy: string | null;
}

function mapToList(map: PermMap): PermissionEntry[] {
  return Object.entries(map).map(([resource, actions]) => ({ resource, actions }));
}

const rowId = (agencyId: string, role: string) => `${agencyId}:${role}`;

/** Rows an earlier build wrote under a since-renamed key. They are the same
 * seat, so they answer for the modern one rather than showing up beside it. */
const canonical = (role: string) =>
  role in DEFAULT_ROLE_PERMISSIONS ? role : (LEGACY_ROLES[role] ?? role);

/** A role key an agency invented, derived from what they called it. */
function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return base || "role";
}

// Idempotently create per-role rows for a new agency from the defaults.
export async function seedAgencyPermissions(agencyId: string): Promise<void> {
  await Promise.all(
    BUILT_IN_ROLES.map((role) => {
      const permissions = (DEFAULT_ROLE_PERMISSIONS[role] ?? {}) as PermMap;
      return db
        .insert(rolePermission)
        .values({
          id: rowId(agencyId, role),
          agencyId,
          role,
          permissions,
          scope: defaultScopesFor(role, Object.keys(permissions)) as ScopeMap,
          system: true,
        })
        .onConflictDoNothing();
    }),
  );
}

export async function listPermissions(agencyId: string): Promise<RoleRecord[]> {
  let rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));
  if (rows.length === 0) {
    await seedAgencyPermissions(agencyId);
    rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));
  }

  // Built-in roles first, in the order the model declares them, then the roles
  // the agency invented — so a built-in role added by an upgrade still appears
  // for an agency seeded before it existed. `system` is what makes a row
  // built-in, not its name: a legacy key answers for the role it was renamed to.
  const ordered = [...BUILT_IN_ROLES, ...rows.filter((row) => !row.system).map((row) => row.role)];

  return ordered.map((role) => {
    const row = rows.find((r) => r.role === role) ?? rows.find((r) => canonical(r.role) === role);
    const permissions = (row?.permissions ?? DEFAULT_ROLE_PERMISSIONS[role] ?? {}) as PermMap;
    return {
      role,
      system: row ? row.system : BUILT_IN_ROLES.includes(role),
      label: row?.label ?? null,
      description: row?.description ?? null,
      icon: row?.icon ?? null,
      permissions: mapToList(permissions),
      scope: (row?.scope ?? defaultScopesFor(role, Object.keys(permissions))) as ScopeMap,
      updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
      updatedBy: row?.updatedBy ?? null,
    };
  });
}

export interface RoleHolder {
  id: string;
  name: string;
  email: string;
}

/** Who currently holds each role — the role cards' counts and the members sheet. */
export async function roleHolders(agencyId: string) {
  const rows = await db
    .select({ id: user.id, role: user.role, name: user.name, email: user.email })
    .from(user)
    .where(and(eq(user.agencyId, agencyId), ne(user.status, "inactive")));
  const holders: Record<string, { count: number; names: string[]; members: RoleHolder[] }> = {};
  for (const row of rows) {
    const role = canonical(row.role);
    const entry = holders[role] ?? { count: 0, names: [], members: [] };
    entry.count += 1;
    entry.names.push(row.name);
    // The sheet shows a page of holders and links out for the rest.
    if (entry.members.length < 12) {
      entry.members.push({ id: row.id, name: row.name, email: row.email });
    }
    holders[role] = entry;
  }
  return holders;
}

/** Does this role hold `action` on `resource`? The API's own gate — the UI's is cosmetic. */
export async function roleCan(
  agencyId: string,
  role: string,
  resource: string,
  action: AccessAction,
): Promise<boolean> {
  const rows = await db
    .select({ role: rolePermission.role, permissions: rolePermission.permissions })
    .from(rolePermission)
    .where(eq(rolePermission.agencyId, agencyId));
  const key = canonical(role);
  const row = rows.find((r) => r.role === role) ?? rows.find((r) => canonical(r.role) === key);
  const map = (row?.permissions ?? DEFAULT_ROLE_PERMISSIONS[key] ?? {}) as PermMap;
  return (map["*"] ?? []).includes(action) || (map[resource] ?? []).includes(action);
}

export interface UpdateRoleInput {
  permissions: PermissionEntry[];
  scope?: Record<string, RecordScope>;
  actor?: string;
}

/**
 * Merges the sent resources into the stored map rather than replacing it. The
 * matrix deliberately omits route-gating resources (`settings`, `dashboard`),
 * and a wholesale replace would wipe them — locking every role out of the
 * screen that contains the matrix.
 */
export async function updateRolePermissions(
  agencyId: string,
  role: string,
  input: UpdateRoleInput,
): Promise<RoleRecord | null> {
  // Write back to whichever row answered the read, so editing a role an older
  // build stored under a legacy key updates that row instead of forking a
  // second one the agency's users are not on.
  const rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));
  const existing =
    rows.find((r) => r.role === role) ?? rows.find((r) => canonical(r.role) === role);
  if (!existing && !BUILT_IN_ROLES.includes(role)) return null;
  const id = existing?.id ?? rowId(agencyId, role);

  const stored = (existing?.permissions ?? DEFAULT_ROLE_PERMISSIONS[role] ?? {}) as PermMap;
  const permissions: PermMap = { ...stored };
  for (const { resource, actions } of input.permissions) {
    if (actions.length === 0) delete permissions[resource];
    else permissions[resource] = actions;
  }

  const scope: ScopeMap = {
    ...((existing?.scope ?? defaultScopesFor(role, Object.keys(stored))) as ScopeMap),
    ...(input.scope ?? {}),
  };
  const updatedAt = new Date();

  await db
    .insert(rolePermission)
    .values({
      id,
      agencyId,
      role: existing?.role ?? role,
      permissions,
      scope,
      system: existing?.system ?? true,
      label: existing?.label ?? null,
      description: existing?.description ?? null,
      icon: existing?.icon ?? null,
      updatedAt,
      updatedBy: input.actor ?? null,
    })
    .onConflictDoUpdate({
      target: rolePermission.id,
      set: { permissions, scope, updatedAt, updatedBy: input.actor ?? null },
    });

  return {
    role,
    system: existing?.system ?? true,
    label: existing?.label ?? null,
    description: existing?.description ?? null,
    icon: existing?.icon ?? null,
    permissions: mapToList(permissions),
    scope,
    updatedAt: updatedAt.toISOString(),
    updatedBy: input.actor ?? null,
  };
}

export interface CreateRoleInput {
  label: string;
  description?: string;
  icon?: string;
  /** Role to copy permissions and scopes from. Omitted (or "blank") starts empty. */
  from?: string;
  actor?: string;
}

export async function createRole(
  agencyId: string,
  input: CreateRoleInput,
): Promise<RoleRecord | { error: "duplicate" }> {
  const label = input.label.trim();
  const rows = await db.select().from(rolePermission).where(eq(rolePermission.agencyId, agencyId));

  const taken = rows.some((row) => (row.label ?? row.role).toLowerCase() === label.toLowerCase());
  if (taken) return { error: "duplicate" };

  // The label is what the agency typed; the key is what everything else stores,
  // so it has to stay unique within the agency.
  const base = slugify(label);
  let role = base;
  for (let n = 2; rows.some((row) => row.role === role) || BUILT_IN_ROLES.includes(role); n += 1) {
    role = `${base}-${n}`;
  }

  const source = input.from && input.from !== "blank" ? input.from : null;
  const sourceRow = source ? rows.find((row) => row.role === source) : undefined;
  const permissions = source
    ? ((sourceRow?.permissions ?? DEFAULT_ROLE_PERMISSIONS[source] ?? {}) as PermMap)
    : {};
  const scope = (
    source
      ? (sourceRow?.scope ?? defaultScopesFor(source, Object.keys(permissions)))
      : defaultScopesFor(role, Object.keys(DEFAULT_ROLE_PERMISSIONS.recruiter ?? {}))
  ) as ScopeMap;

  const updatedAt = new Date();
  const record: RoleRecord = {
    role,
    system: false,
    label,
    description: input.description ?? null,
    icon: input.icon ?? "certificate",
    permissions: mapToList(permissions),
    scope,
    updatedAt: updatedAt.toISOString(),
    updatedBy: input.actor ?? null,
  };

  await db.insert(rolePermission).values({
    id: rowId(agencyId, role),
    agencyId,
    role,
    permissions,
    scope,
    label: record.label,
    description: record.description,
    icon: record.icon,
    system: false,
    updatedAt,
    updatedBy: record.updatedBy,
  });

  return record;
}

export interface DeleteRoleResult {
  role: string;
  label: string;
  moved: number;
  reassignedTo: string;
}

/**
 * Deletes a custom role and moves everyone holding it. Nobody is left holding a
 * role that no longer exists — that resolves to least privilege silently, which
 * reads as "my access broke overnight".
 */
export async function deleteRole(
  agencyId: string,
  role: string,
  reassignTo: string,
): Promise<DeleteRoleResult | { error: "system" | "missing" | "unknownTarget" }> {
  const [row] = await db
    .select()
    .from(rolePermission)
    .where(eq(rolePermission.id, rowId(agencyId, role)));
  if (!row) return { error: "missing" };
  if (row.system) return { error: "system" };

  const target = reassignTo || "recruiter";
  const [targetRow] = await db
    .select({ id: rolePermission.id })
    .from(rolePermission)
    .where(eq(rolePermission.id, rowId(agencyId, target)));
  if (!targetRow && !BUILT_IN_ROLES.includes(target)) return { error: "unknownTarget" };

  const moved = await db
    .update(user)
    .set({ role: target })
    .where(and(eq(user.agencyId, agencyId), eq(user.role, role)))
    .returning({ id: user.id });

  await db.delete(rolePermission).where(eq(rolePermission.id, rowId(agencyId, role)));

  return { role, label: row.label ?? role, moved: moved.length, reassignedTo: target };
}
