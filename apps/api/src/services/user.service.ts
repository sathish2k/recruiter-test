import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { subscription } from "../models/billing.model";
import { userSecurity } from "../models/security.model";

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

/** "Jul 20, 2026 · 7:02 PM" — the tooltip format behind the relative label. */
function absoluteStamp(date: Date): string {
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} · ${time}`;
}

type UserRow = typeof user.$inferSelect;

/** Extra per-row state the members table needs but `user` doesn't carry. */
interface MapUserContext {
  /** Who's asking — drives the "(you)" marker. */
  viewerId?: string;
  /** User ids with two-factor on, from `user_security`. */
  mfaOn?: Set<string>;
}

function mapUser(u: UserRow, index: number, ctx: MapUserContext = {}) {
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
    /** Absolute timestamp behind the relative label, for the cell's tooltip. */
    lastActiveFull: u.updatedAt ? absoluteStamp(u.updatedAt) : "—",
    isCurrentUser: !!ctx.viewerId && u.id === ctx.viewerId,
    /** The owner's role can't be reassigned from this table. */
    isOwner: u.role === "admin",
    mfaEnabled: ctx.mfaOn?.has(u.id) ?? false,
    clientAccess: u.clientAccess ?? [],
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

/** Seat meter numbers: the plan's allowance against live members. */
async function seatUsage(agencyId: string) {
  const [plan] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, agencyId))
    .limit(1);
  const seatTotal = plan?.seatTotal ?? 5;
  const usedRows = await db
    .select({ total: count() })
    .from(user)
    .where(and(eq(user.agencyId, agencyId), ne(user.status, "inactive")));
  const seatUsed = usedRows[0]?.total ?? 0;
  return {
    seatUsed,
    seatTotal,
    seatPercent: seatTotal > 0 ? Math.min(100, Math.round((seatUsed / seatTotal) * 100)) : 0,
    seatFull: seatUsed >= seatTotal,
  };
}

export async function listUsers(agencyId: string, query: ListUsersQuery = {}, viewerId?: string) {
  // `suspended` members stay listed (the design shows and un-suspends them);
  // only hard-deactivated ones drop out.
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

  // One round-trip for the whole page's two-factor state.
  const ids = rows.map((r) => r.id);
  const mfaRows = ids.length
    ? await db
        .select({ userId: userSecurity.userId, on: userSecurity.twoFactorEnabled })
        .from(userSecurity)
        .where(inArray(userSecurity.userId, ids))
    : [];
  const mfaOn = new Set(mfaRows.filter((r) => r.on).map((r) => r.userId));

  const seats = await seatUsage(agencyId);
  return {
    data: rows.map((row, i) => mapUser(row, i, { viewerId, mfaOn })),
    totalCount: total,
    meta: seats,
  };
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

/** Suspend keeps the row (and its seat) but blocks sign-in; the design offers
 * it as a reversible pair, unlike the one-way deactivate. */
export async function setUserSuspended(id: string, suspended: boolean) {
  const [updated] = await db
    .update(user)
    .set({ status: suspended ? "suspended" : "active", updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning();
  return updated ? { id: updated.id, status: updated.status, displayName: updated.name } : null;
}

/** Hard-removes a member from the agency. */
export async function removeUser(id: string) {
  const [removed] = await db.delete(user).where(eq(user.id, id)).returning();
  return removed ? { id: removed.id, displayName: removed.name } : null;
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
