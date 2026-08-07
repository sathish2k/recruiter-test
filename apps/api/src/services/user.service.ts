import { randomUUID } from "node:crypto";
import { normaliseRole } from "@recruit/types";
import { and, asc, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { subscription } from "../models/billing.model";
import { userSecurity } from "../models/security.model";

/** The seats this workspace hands out. `client` is a portal identity, not a
 * member, so it is never assignable from the members screen. */
const ROLES = ["owner", "admin", "profileLead", "recruiter", "sourcer"];

/** Statuses the members list reports counts for, in the design's order. */
const STATUSES = ["active", "invited", "inactive", "suspended"] as const;

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

// ponytail: presence is inferred from the same `updatedAt` stamp last-active
// reads — there is no heartbeat yet, so it is a freshness band, not a session.
function presenceOf(status: string, date?: Date | null): "online" | "away" | "offline" {
  if (status !== "active" || !date) return "offline";
  const minutes = (Date.now() - date.getTime()) / 60_000;
  if (minutes < 15) return "online";
  if (minutes < 1_440) return "away";
  return "offline";
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
  const status = u.status ?? "active";
  const role = normaliseRole(u.role);
  return {
    id: u.id,
    name: u.name,
    displayName: u.name,
    email: u.email,
    // A live row may still carry a role string an earlier build wrote, so it is
    // normalised on the way out — the screen only knows the current vocabulary.
    role,
    team: u.team ?? "",
    status,
    presence: presenceOf(status, u.updatedAt),
    initials: initials(u.name),
    avatarBg: palette.bg,
    avatarFg: palette.fg,
    lastActive: lastActiveLabel(u.updatedAt),
    /** Absolute timestamp behind the relative label, for the cell's tooltip. */
    lastActiveFull: u.updatedAt ? absoluteStamp(u.updatedAt) : "—",
    isCurrentUser: !!ctx.viewerId && u.id === ctx.viewerId,
    /** The owner is managed from billing, not from this table. */
    isOwner: role === "owner",
    /** Dims the row and swaps deactivate for reactivate. */
    isInactive: status === "inactive",
    mfaEnabled: ctx.mfaOn?.has(u.id) ?? false,
    clientAccess: u.clientAccess ?? [],
  };
}

export interface ListUsersQuery {
  search?: string;
  /** Comma-joined by the datasource for multiselect filters. */
  role?: string;
  status?: string;
  team?: string;
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
  team: user.team,
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

/** Per-status row counts, the tallies behind the status filter's segments.
 * Counted over the whole workspace, so the segment a filter hides still
 * reports how many it would show. */
async function statusCounts(agencyId: string) {
  const rows = await db
    .select({ status: user.status, total: count() })
    .from(user)
    .where(eq(user.agencyId, agencyId))
    .groupBy(user.status);
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.total]));
  return {
    all: rows.reduce((sum, r) => sum + r.total, 0),
    ...Object.fromEntries(STATUSES.map((s) => [s, byStatus[s] ?? 0])),
  } as Record<string, number>;
}

/** Active holders per role — the Roles card's "4 members" line. */
async function roleCounts(agencyId: string) {
  const rows = await db
    .select({ role: user.role, total: count() })
    .from(user)
    .where(and(eq(user.agencyId, agencyId), eq(user.status, "active")))
    .groupBy(user.role);
  const counts: Record<string, number> = {};
  // Legacy role strings collapse onto the role they resolve to, so a workspace
  // mid-rename doesn't report the same people under two names.
  for (const row of rows) {
    const role = normaliseRole(row.role);
    counts[role] = (counts[role] ?? 0) + row.total;
  }
  return counts;
}

/** Every desk name in use, for the team filter's options. */
async function teamNames(agencyId: string) {
  const rows = await db
    .selectDistinct({ team: user.team })
    .from(user)
    .where(eq(user.agencyId, agencyId))
    .orderBy(asc(user.team));
  return rows.map((r) => r.team).filter((team): team is string => !!team);
}

export async function listUsers(agencyId: string, query: ListUsersQuery = {}, viewerId?: string) {
  // Deactivated members stay listed — the design dims them and offers a
  // reactivate action, so hiding them would strand the only way back.
  const conditions = [eq(user.agencyId, agencyId)];

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    const match = or(ilike(user.name, term), ilike(user.email, term));
    if (match) conditions.push(match);
  }
  const roles = csv(query.role);
  if (roles.length) conditions.push(inArray(user.role, roles));
  const statuses = csv(query.status);
  if (statuses.length) conditions.push(inArray(user.status, statuses));
  const teams = csv(query.team);
  if (teams.length) conditions.push(inArray(user.team, teams));

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

  const [seats, byStatus, byRole, teamOptions] = await Promise.all([
    seatUsage(agencyId),
    statusCounts(agencyId),
    roleCounts(agencyId),
    teamNames(agencyId),
  ]);
  return {
    data: rows.map((row, i) => mapUser(row, i, { viewerId, mfaOn })),
    totalCount: total,
    meta: {
      ...seats,
      statusCounts: byStatus,
      roleCounts: byRole,
      teams: teamOptions,
      // Drives the seat-limit banner's "deactivate someone" advice.
      inactiveCount: byStatus.inactive ?? 0,
    },
  };
}

/** How many active owners the workspace has — a workspace may never be left
 * without one, so demoting or switching off the last one is refused. */
export async function activeOwnerCount(agencyId: string) {
  const rows = await db
    .select({ total: count() })
    .from(user)
    .where(and(eq(user.agencyId, agencyId), eq(user.role, "owner"), eq(user.status, "active")));
  return rows[0]?.total ?? 0;
}

/** True when changing this member would leave the workspace ownerless. */
export async function isLastOwner(agencyId: string, id: string) {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!row || normaliseRole(row.role) !== "owner" || row.status !== "active") return false;
  return (await activeOwnerCount(agencyId)) <= 1;
}

/** Name, role and team — everything the edit dialog offers. The address is the
 * sign-in identity and is changed from the member's own profile, not here. */
export interface UpdateUserInput {
  name?: string;
  role?: string;
  team?: string;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  if (input.role !== undefined && !ROLES.includes(input.role)) return null;
  const [updated] = await db
    .update(user)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.team !== undefined ? { team: input.team || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();
  return updated
    ? {
        id: updated.id,
        role: normaliseRole(updated.role),
        team: updated.team ?? "",
        displayName: updated.name,
      }
    : null;
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

/** Switches a deactivated member back on with the role they held. Refused when
 * there is no seat for them — the caller reports why. */
export async function activateUser(agencyId: string, id: string) {
  const [updated] = await db
    .update(user)
    .set({ status: "active", updatedAt: new Date() })
    .where(and(eq(user.id, id), eq(user.agencyId, agencyId)))
    .returning();
  return updated
    ? {
        id: updated.id,
        status: updated.status,
        role: normaliseRole(updated.role),
        displayName: updated.name,
      }
    : null;
}

/** One member, scoped to the agency — so an id from another workspace is a
 * miss rather than a leak. */
export async function findAgencyUser(agencyId: string, id: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(and(eq(user.id, id), eq(user.agencyId, agencyId)))
    .limit(1);
  return row ?? null;
}

/** Seat headroom, read before an invite or a reactivation is allowed. */
export async function hasFreeSeat(agencyId: string) {
  const { seatFull } = await seatUsage(agencyId);
  return !seatFull;
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
