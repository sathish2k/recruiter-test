import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";

const ROLES = ["admin", "lead", "employee", "client"];

const AVATAR_PALETTE = [
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
] as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ponytail: last-active derives from updatedAt (no activity tracking yet).
function lastActiveLabel(date?: Date | null): string {
  if (!date) return "—";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 5) return "Now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type UserRow = typeof user.$inferSelect;

function mapUser(u: UserRow, index: number) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
  return {
    id: u.id,
    name: u.name,
    displayName: u.name,
    email: u.email,
    role: u.role,
    status: u.status ?? "active",
    initials: initials(u.name),
    avatarBg: palette.bg,
    avatarFg: palette.fg,
    lastActive: lastActiveLabel(u.updatedAt),
  };
}

export interface ListUsersQuery {
  search?: string;
  /** Comma-joined by the datasource for multiselect filters. */
  role?: string;
  status?: string;
  sortKey?: string;
  sortDir?: string;
  page?: string | number;
  pageSize?: string | number;
}

const SORT_FIELDS = {
  member: user.name,
  displayName: user.name,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  lastActive: user.updatedAt,
} as const;

function csv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function listUsers(agencyId: string, query: ListUsersQuery = {}) {
  const conditions = [eq(user.agencyId, agencyId), ne(user.status, "inactive")];

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    const match = or(ilike(user.name, term), ilike(user.email, term));
    if (match) conditions.push(match);
  }
  const roles = csv(query.role);
  if (roles.length) conditions.push(inArray(user.role, roles));
  const statuses = csv(query.status);
  if (statuses.length) conditions.push(inArray(user.status, statuses));

  const where = and(...conditions);
  const sortColumn = SORT_FIELDS[query.sortKey as keyof typeof SORT_FIELDS] ?? user.createdAt;
  const order = query.sortDir === "desc" ? desc(sortColumn) : asc(sortColumn);

  const countRows = await db.select({ total: count() }).from(user).where(where);
  const total = countRows[0]?.total ?? 0;

  const pageSize = Number(query.pageSize ?? 0);
  const page = Math.max(1, Number(query.page ?? 1));
  const base = db.select().from(user).where(where).orderBy(order);
  const rows = pageSize > 0 ? await base.limit(pageSize).offset((page - 1) * pageSize) : await base;

  return { data: rows.map(mapUser), totalCount: total };
}

export async function updateUserRole(id: string, role: string) {
  if (!ROLES.includes(role)) return null;
  const [updated] = await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();
  return updated ? { id: updated.id, role: updated.role, displayName: updated.name } : null;
}

export async function deactivateUser(id: string) {
  const [updated] = await db
    .update(user)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();
  return updated ? { id: updated.id, status: updated.status, displayName: updated.name } : null;
}

// ponytail: invited users get a user row but no credential account until they
// set a password via the reset-password flow.
export async function inviteUser(agencyId: string, email: string, role: string) {
  if (!ROLES.includes(role)) return null;
  const [created] = await db
    .insert(user)
    .values({
      id: randomUUID(),
      agencyId,
      email,
      name: email.split("@")[0] ?? email,
      role,
      status: "invited",
    })
    .returning();
  return created
    ? {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        status: created.status,
      }
    : null;
}
